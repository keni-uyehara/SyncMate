// Service for interacting with the glossary extractor cloud function
export interface GlossaryTerm {
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

class GlossaryService {
  private baseUrl: string;

  constructor() {
    // Use the API base URL from environment variables
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173';
  }

  async extractGlossary(request: ExtractionRequest): Promise<ProcessingResult> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('datasetId', request.datasetId);
    
    if (request.businessContext) {
      formData.append('businessContext', request.businessContext);
    }
    
    if (request.extractionMode) {
      formData.append('extractionMode', request.extractionMode);
    }

    const response = await fetch(`${this.baseUrl}/api/glossary/extract`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getGlossaryTerms(datasetId: string): Promise<GlossaryTerm[]> {
    const response = await fetch(`${this.baseUrl}/api/glossary/${datasetId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch glossary terms: ${response.status}`);
    }

    return await response.json();
  }

  async saveGlossaryTerms(terms: GlossaryTerm[], datasetId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/glossary/${datasetId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ terms }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save glossary terms: ${response.status}`);
    }
  }
}

export const glossaryService = new GlossaryService();
