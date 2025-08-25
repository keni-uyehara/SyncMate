// Glossary API endpoints for SyncMate Functions
import { createClient } from '@supabase/supabase-js';
import { Request, Response } from 'express';
import multer from 'multer';
import csv from 'csv-parse';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Types
interface GlossaryTerm {
  term: string;
  definition: string;
  source_columns: string[];
  data_types?: string[];
  sample_values?: string[];
  synonyms?: string[];
  category?: string;
  confidence: number;
  source_file_id?: string;
  source_filename?: string;
  dataset_id?: string;
}

interface ProcessingResult {
  datasetId: string;
  termsExtracted: number;
  processingTime: number;
  fileMetadata: {
    filename: string;
    mimetype: string;
    size: number;
    datasetId: string;
  };
  terms: GlossaryTerm[];
  warnings?: string[];
}

// Helper function to detect data type from sample values
function detectDataType(values: string[]): string {
  if (values.length === 0) return 'string';
  
  const sample = values[0];
  
  // Check if it's a date
  if (sample.match(/^\d{4}-\d{2}-\d{2}$/) || sample.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return 'date';
  }
  
  // Check if it's a number
  if (!isNaN(Number(sample)) && sample.trim() !== '') {
    return 'numeric';
  }
  
  // Check if it's an email
  if (sample.includes('@') && sample.includes('.')) {
    return 'email';
  }
  
  // Check if it's a phone number
  if (sample.match(/^[\+]?[0-9\s\-\(\)]+$/)) {
    return 'phone';
  }
  
  return 'string';
}

// Helper function to generate definition from term name
function generateDefinition(term: string): string {
  const cleanTerm = term.toLowerCase().replace(/[_-]/g, ' ');
  
  // Common patterns
  if (term.includes('id')) return `Unique identifier for ${cleanTerm.replace('id', '').trim()}`;
  if (term.includes('email')) return `Email address for ${cleanTerm.replace('email', '').trim()}`;
  if (term.includes('phone')) return `Phone number for ${cleanTerm.replace('phone', '').trim()}`;
  if (term.includes('date')) return `Date when ${cleanTerm.replace('date', '').trim()} occurred`;
  if (term.includes('amount') || term.includes('price') || term.includes('cost')) {
    return `Monetary value of ${cleanTerm.replace(/amount|price|cost/g, '').trim()}`;
  }
  if (term.includes('status')) return `Current status of ${cleanTerm.replace('status', '').trim()}`;
  if (term.includes('name')) return `Name of ${cleanTerm.replace('name', '').trim()}`;
  
  return `Data field representing ${cleanTerm}`;
}

// Helper function to categorize terms
function categorizeTerm(term: string): string {
  const lowerTerm = term.toLowerCase();
  
  if (lowerTerm.includes('id')) return 'identifier';
  if (lowerTerm.includes('email') || lowerTerm.includes('phone') || lowerTerm.includes('address')) {
    return 'contact_info';
  }
  if (lowerTerm.includes('date') || lowerTerm.includes('time')) return 'temporal';
  if (lowerTerm.includes('amount') || lowerTerm.includes('price') || lowerTerm.includes('cost') || lowerTerm.includes('balance')) {
    return 'financial';
  }
  if (lowerTerm.includes('status') || lowerTerm.includes('type') || lowerTerm.includes('category')) {
    return 'classification';
  }
  if (lowerTerm.includes('name') || lowerTerm.includes('title')) return 'descriptive';
  
  return 'data_field';
}

// POST /api/glossary/extract - Extract terms from uploaded file
export const extractGlossary = [
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      const file = req.file;
      const datasetId = req.body.datasetId;
      const businessContext = req.body.businessContext;
      const extractionMode = req.body.extractionMode || 'basic';

      if (!file || !datasetId) {
        return res.status(400).json({ error: 'File and datasetId are required' });
      }

      // Parse CSV file
      const fileContent = file.buffer.toString();
      const lines = fileContent.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        return res.status(400).json({ error: 'File is empty or invalid' });
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '')).filter(Boolean);
      
      // Extract sample values from first few rows
      const sampleRows = lines.slice(1, Math.min(5, lines.length));
      const sampleData: string[][] = [];
      
      for (const row of sampleRows) {
        const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
        sampleData.push(values);
      }

      // Generate glossary terms
      const terms: GlossaryTerm[] = headers.map((header, index) => {
        const sampleValues = sampleData.map(row => row[index]).filter(Boolean);
        const dataType = detectDataType(sampleValues);
        const definition = generateDefinition(header);
        const category = categorizeTerm(header);
        
        return {
          term: header,
          definition,
          source_columns: [header],
          data_types: [dataType],
          sample_values: sampleValues.slice(0, 3), // Limit to 3 samples
          synonyms: [],
          category,
          confidence: 0.8, // Default confidence
          source_file_id: file.originalname,
          source_filename: file.originalname,
          dataset_id: datasetId
        };
      });

      // Save terms to Supabase
      const { error: insertError } = await supabase
        .from('glossary_terms')
        .insert(terms);

      if (insertError) {
        console.error('Error saving terms to Supabase:', insertError);
        return res.status(500).json({ error: 'Failed to save terms to database' });
      }

      const processingTime = Date.now() - startTime;

      const result: ProcessingResult = {
        datasetId,
        termsExtracted: terms.length,
        processingTime,
        fileMetadata: {
          filename: file.originalname || 'unknown',
          mimetype: file.mimetype || 'text/csv',
          size: file.size,
          datasetId
        },
        terms,
        warnings: []
      };

      res.json(result);
    } catch (error) {
      console.error('Glossary extraction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

// GET /api/glossary/:datasetId - Get terms for a dataset
export const getGlossaryTerms = async (req: Request, res: Response) => {
  try {
    const { datasetId } = req.params;

    if (!datasetId) {
      return res.status(400).json({ error: 'Dataset ID is required' });
    }

    let query = supabase
      .from('glossary_terms')
      .select('*')
      .order('created_at', { ascending: false });

    // If datasetId is 'all', don't filter by dataset
    if (datasetId !== 'all') {
      query = query.eq('dataset_id', datasetId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching glossary terms:', error);
      return res.status(500).json({ error: 'Failed to fetch glossary terms' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Get glossary terms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/glossary/:datasetId - Save terms for a dataset
export const saveGlossaryTerms = async (req: Request, res: Response) => {
  try {
    const { datasetId } = req.params;
    const { terms } = req.body;

    if (!datasetId || !terms || !Array.isArray(terms)) {
      return res.status(400).json({ error: 'Dataset ID and terms array are required' });
    }

    // First, delete existing terms for this dataset
    const { error: deleteError } = await supabase
      .from('glossary_terms')
      .delete()
      .eq('dataset_id', datasetId);

    if (deleteError) {
      console.error('Error deleting existing terms:', deleteError);
      return res.status(500).json({ error: 'Failed to clear existing terms' });
    }

    // Then insert new terms
    const { error: insertError } = await supabase
      .from('glossary_terms')
      .insert(terms);

    if (insertError) {
      console.error('Error inserting terms:', insertError);
      return res.status(500).json({ error: 'Failed to save terms' });
    }

    res.json({ message: 'Terms saved successfully', count: terms.length });
  } catch (error) {
    console.error('Save glossary terms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/glossary/datasets - Get all available datasets
export const getAvailableDatasets = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('glossary_terms')
      .select('dataset_id')
      .not('dataset_id', 'is', null);

    if (error) {
      console.error('Error fetching datasets:', error);
      return res.status(500).json({ error: 'Failed to fetch datasets' });
    }

    const datasets = [...new Set(data?.map(item => item.dataset_id).filter(Boolean))];
    res.json(datasets);
  } catch (error) {
    console.error('Get datasets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
