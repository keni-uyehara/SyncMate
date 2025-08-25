import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import { supabaseGlossaryService } from '../../lib/supabaseGlossaryService';
import type { GlossaryTerm } from '../../lib/supabaseGlossaryService';
import { Search, Filter, Download, RefreshCw, Loader2, Database } from 'lucide-react';
import toast from 'react-hot-toast';

export const SimpleGlossaryTab: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    datasetId: '',
    businessContext: '',
    extractionMode: 'comprehensive' as 'basic' | 'comprehensive',
    file: null as File | null
  });

  const categories = Array.from(new Set(terms.map(term => term.category).filter(Boolean)));

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.file || !formData.datasetId) {
      toast.error('Please select a file and enter a dataset ID');
      return;
    }

    setIsProcessing(true);

    try {
      const extractionResult = await supabaseGlossaryService.extractGlossary({
        datasetId: formData.datasetId,
        businessContext: formData.businessContext || undefined,
        extractionMode: formData.extractionMode,
        file: formData.file
      });

      setTerms(extractionResult.terms);
      toast.success(`Successfully extracted ${extractionResult.termsExtracted} terms!`);
    } catch (error) {
      console.error('Glossary extraction failed:', error);
      toast.error(`Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadGlossaryTerms = async () => {
    if (!formData.datasetId) return;
    
    setLoading(true);
    try {
      const glossaryTerms = await supabaseGlossaryService.getGlossaryTerms(formData.datasetId);
      setTerms(glossaryTerms);
    } catch (error) {
      console.error('Failed to load glossary terms:', error);
      toast.error('Failed to load glossary terms');
    } finally {
      setLoading(false);
    }
  };

  const filterTerms = () => {
    let filtered = [...terms];

    if (searchTerm) {
      filtered = filtered.filter(term =>
        term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.synonyms?.some(synonym => synonym.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(term => term.category === categoryFilter);
    }

    if (confidenceFilter !== 'all') {
      const confidenceThreshold = parseFloat(confidenceFilter);
      filtered = filtered.filter(term => term.confidence >= confidenceThreshold);
    }

    setFilteredTerms(filtered);
  };

  React.useEffect(() => {
    filterTerms();
  }, [terms, searchTerm, categoryFilter, confidenceFilter]);

  const exportGlossary = () => {
    const csvContent = [
      ['Term', 'Definition', 'Category', 'Confidence', 'Source Columns', 'Synonyms', 'Data Types'],
      ...filteredTerms.map(term => [
        term.term,
        term.definition,
        term.category || '',
        (term.confidence * 100).toFixed(1) + '%',
        term.source_columns?.join('; ') || '',
        term.synonyms?.join('; ') || '',
        term.data_types?.join('; ') || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glossary_${formData.datasetId}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Glossary Viewer */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Glossary
                </CardTitle>
                <CardDescription>
                  {loading ? 'Loading...' : `${filteredTerms.length} terms found`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadGlossaryTerms}
                  disabled={loading || !formData.datasetId}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportGlossary}
                  disabled={filteredTerms.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search terms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category || ''}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by confidence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Confidence Levels</SelectItem>
                    <SelectItem value="0.8">High (≥80%)</SelectItem>
                    <SelectItem value="0.6">Medium (≥60%)</SelectItem>
                    <SelectItem value="0.4">Low (≥40%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Terms Display */}
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredTerms.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  {terms.length === 0 ? 'No glossary terms found for this dataset' : 'No terms match your filters'}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredTerms.map((term, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <h5 className="font-medium text-lg">{term.term}</h5>
                        <div className="flex items-center gap-2">
                          <Badge className={getConfidenceColor(term.confidence)}>
                            {(term.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                          {term.category && (
                            <Badge variant="outline">{term.category}</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600">{term.definition}</p>
                      {term.source_columns && term.source_columns.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-sm text-gray-500">Source columns:</span>
                          {term.source_columns.map((col, colIndex) => (
                            <Badge key={colIndex} variant="outline" className="text-xs">
                              {col}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {term.synonyms && term.synonyms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-sm text-gray-500">Synonyms:</span>
                          {term.synonyms.map((synonym, synIndex) => (
                            <Badge key={synIndex} variant="outline" className="text-xs">
                              {synonym}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
