import { supabase } from '../supabaseClient';

export interface GlossaryTerm {
  id?: number;
  term: string;
  definition: string;
  source_columns: string[] | null;
  data_types?: string[] | null;
  sample_values?: string[] | null;
  synonyms?: string[] | null;
  category?: string | null;
  confidence: number | null;
  source_file_id?: string | null;
  source_filename?: string | null;
  dataset_id: string;
  created_at?: string | null;
  updated_at?: string | null;
  updated_by?: string;
}

export interface ColumnPreview {
  name: string;
  detectedType: string;
  samples: string[];
  nullCount: number;
  uniqueCount: number;
  statistics?: {
    min?: number;
    max?: number;
    avg?: number;
  };
}

export interface ProcessingResult {
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

export interface ExtractionRequest {
  datasetId: string;
  businessContext?: string;
  extractionMode?: 'basic' | 'comprehensive';
  file: File;
}

class SupabaseGlossaryService {
  // Helper function to detect data type from sample values
  private detectDataType(values: string[]): string {
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
  private generateDefinition(term: string): string {
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
  private categorizeTerm(term: string): string {
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

  async extractGlossary(request: ExtractionRequest): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Read the file content
      const fileContent = await request.file.text();
      const lines = fileContent.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('File is empty or invalid');
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
        const dataType = this.detectDataType(sampleValues);
        const definition = this.generateDefinition(header);
        const category = this.categorizeTerm(header);
        
        return {
          term: header,
          definition,
          source_columns: [header],
          data_types: [dataType],
          sample_values: sampleValues.slice(0, 3), // Limit to 3 samples
          synonyms: [],
          category,
          confidence: 0.8, // Default confidence
          source_file_id: request.file.name,
          source_filename: request.file.name,
          dataset_id: request.datasetId
        };
      });

      // Save terms to Supabase
      const { error: insertError } = await supabase
        .from('data_glossary')
        .insert(terms);

      if (insertError) {
        console.error('Error saving terms to Supabase:', insertError);
        throw new Error('Failed to save terms to database');
      }

      const processingTime = Date.now() - startTime;

      return {
        datasetId: request.datasetId,
        termsExtracted: terms.length,
        processingTime,
        fileMetadata: {
          filename: request.file.name,
          mimetype: request.file.type,
          size: request.file.size,
          datasetId: request.datasetId
        },
        terms,
        warnings: []
      };
    } catch (error) {
      console.error('Glossary extraction error:', error);
      throw error;
    }
  }

  async getGlossaryTerms(datasetId: string): Promise<GlossaryTerm[]> {
    try {
      console.log('Getting glossary terms for datasetId:', datasetId);
      
      let query = supabase
        .from('data_glossary')
        .select('*')
        .order('created_at', { ascending: false });

      // If datasetId is 'all', don't filter by dataset
      if (datasetId !== 'all') {
        query = query.eq('dataset_id', datasetId);
      }

      const { data, error } = await query;

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Error fetching glossary terms:', error);
        throw new Error(`Failed to fetch glossary terms: ${error.message}`);
      }

      console.log('Returning terms:', data || []);
      return data || [];
    } catch (error) {
      console.error('Get glossary terms error:', error);
      throw error;
    }
  }

  async saveGlossaryTerms(terms: GlossaryTerm[], datasetId: string): Promise<void> {
    try {
      // First, delete existing terms for this dataset
      const { error: deleteError } = await supabase
        .from('data_glossary')
        .delete()
        .eq('dataset_id', datasetId);

      if (deleteError) {
        console.error('Error deleting existing terms:', deleteError);
        throw new Error('Failed to clear existing terms');
      }

      // Then insert new terms
      const { error: insertError } = await supabase
        .from('data_glossary')
        .insert(terms);

      if (insertError) {
        console.error('Error inserting terms:', insertError);
        throw new Error('Failed to save terms');
      }
    } catch (error) {
      console.error('Save glossary terms error:', error);
      throw error;
    }
  }

  async updateGlossaryTerm(termId: number, updates: Partial<GlossaryTerm>): Promise<void> {
    try {
      const { error } = await supabase
        .from('data_glossary')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', termId);

      if (error) {
        console.error('Error updating glossary term:', error);
        throw new Error('Failed to update glossary term');
      }
    } catch (error) {
      console.error('Update glossary term error:', error);
      throw error;
    }
  }

  async deleteGlossaryTerm(termId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('data_glossary')
        .delete()
        .eq('id', termId);

      if (error) {
        console.error('Error deleting glossary term:', error);
        throw new Error('Failed to delete glossary term');
      }
    } catch (error) {
      console.error('Delete glossary term error:', error);
      throw error;
    }
  }

  async getAvailableDatasets(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('data_glossary')
        .select('dataset_id')
        .not('dataset_id', 'is', null);

      if (error) {
        console.error('Error fetching datasets:', error);
        throw new Error('Failed to fetch datasets');
      }

      return [...new Set(data?.map(item => item.dataset_id).filter(Boolean))];
    } catch (error) {
      console.error('Get datasets error:', error);
      throw error;
    }
  }

  // Method to add sample data for testing
  async addSampleTerms(): Promise<void> {
    try {
      const sampleTerms: GlossaryTerm[] = [
        {
          term: 'customer_id',
          definition: 'Unique identifier for each customer in the system',
          source_columns: ['customer_id'],
          data_types: ['numeric'],
          sample_values: ['1001', '1002', '1003'],
          synonyms: ['client_id', 'user_id'],
          category: 'identifier',
          confidence: 0.95,
          dataset_id: 'customer_data_2024',
          source_filename: 'customers.csv'
        },
        {
          term: 'email_address',
          definition: 'Email address for customer communication',
          source_columns: ['email_address'],
          data_types: ['email'],
          sample_values: ['john@example.com', 'jane@example.com'],
          synonyms: ['email', 'contact_email'],
          category: 'contact_info',
          confidence: 0.90,
          dataset_id: 'customer_data_2024',
          source_filename: 'customers.csv'
        },
        {
          term: 'order_date',
          definition: 'Date when the order was placed',
          source_columns: ['order_date'],
          data_types: ['date'],
          sample_values: ['2024-01-15', '2024-01-16'],
          synonyms: ['purchase_date', 'transaction_date'],
          category: 'temporal',
          confidence: 0.88,
          dataset_id: 'order_data_2024',
          source_filename: 'orders.csv'
        }
      ];

      const { error } = await supabase
        .from('data_glossary')
        .insert(sampleTerms);

      if (error) {
        console.error('Error inserting sample terms:', error);
        throw new Error('Failed to insert sample terms');
      }

      console.log('Sample terms added successfully');
    } catch (error) {
      console.error('Add sample terms error:', error);
      throw error;
    }
  }

  // Method to add a single test term (for debugging)
  async addSingleTestTerm(): Promise<void> {
    try {
      const testTerm: GlossaryTerm = {
        term: 'test_field',
        definition: 'This is a test field for debugging purposes',
        source_columns: ['test_column'],
        data_types: ['string'],
        sample_values: ['test_value_1', 'test_value_2'],
        synonyms: ['test', 'debug_field'],
        category: 'data_field',
        confidence: 0.75,
        dataset_id: 'test_dataset',
        source_filename: 'test.csv'
      };

      const { error } = await supabase
        .from('data_glossary')
        .insert(testTerm);

      if (error) {
        console.error('Error inserting test term:', error);
        throw new Error('Failed to insert test term');
      }

      console.log('Test term added successfully');
    } catch (error) {
      console.error('Add test term error:', error);
      throw error;
    }
  }

  // Method to test if table exists
  async testTableExists(): Promise<boolean> {
    try {
      console.log('Testing if data_glossary table exists...');
      
      // Try to insert a simple test record
      const testTerm: GlossaryTerm = {
        term: 'test_term',
        definition: 'Test definition',
        source_columns: ['test_column'],
        dataset_id: 'test_dataset',
        confidence: 0.5
      };

      const { error } = await supabase
        .from('data_glossary')
        .insert(testTerm);

      if (error) {
        console.error('Table test failed:', error);
        return false;
      }

      // If insert succeeded, delete the test record
      await supabase
        .from('data_glossary')
        .delete()
        .eq('term', 'test_term')
        .eq('dataset_id', 'test_dataset');

      console.log('Table exists and is accessible');
      return true;
    } catch (error) {
      console.error('Table test error:', error);
      return false;
    }
  }

  // Method to check table access and RLS
  async checkTableAccess(): Promise<any> {
    try {
      console.log('Checking table access...');
      
      // First, try a simple select
      const { data: selectData, error: selectError } = await supabase
        .from('data_glossary')
        .select('*')
        .limit(1);
      
      console.log('Select result:', { selectData, selectError });
      
      // Then try to count rows
      const { count, error: countError } = await supabase
        .from('data_glossary')
        .select('*', { count: 'exact', head: true });
      
      console.log('Count result:', { count, countError });
      
      return {
        selectData,
        selectError,
        count,
        countError
      };
    } catch (error) {
      console.error('Table access check error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Method to check authentication status
  async checkAuthStatus(): Promise<any> {
    try {
      console.log('Checking authentication status...');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('User:', user);
      console.log('User error:', userError);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session:', session);
      console.log('Session error:', sessionError);
      
      return {
        user,
        userError,
        session,
        sessionError,
        isAuthenticated: !!user && !userError
      };
    } catch (error) {
      console.error('Auth check error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const supabaseGlossaryService = new SupabaseGlossaryService();
