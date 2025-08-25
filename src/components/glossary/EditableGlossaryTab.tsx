import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';

import { supabaseGlossaryService } from '../../lib/supabaseGlossaryService';
import type { GlossaryTerm } from '../../lib/supabaseGlossaryService';
import { Search, Filter, Download, RefreshCw, Loader2, Database, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const EditableGlossaryTab: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');

  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    datasetId: '',
    businessContext: '',
    extractionMode: 'comprehensive' as 'basic' | 'comprehensive',
    file: null as File | null
  });

  const categories = Array.from(new Set(terms.map(term => term.category).filter(Boolean)));

  // Load all glossary terms on component mount
  useEffect(() => {
    loadGlossaryTerms();
  }, []);

  const loadGlossaryTerms = async () => {
    setLoading(true);
    try {
      console.log('Loading glossary terms...');
      const glossaryTerms = await supabaseGlossaryService.getGlossaryTerms('all');
      console.log('Loaded terms:', glossaryTerms);
      setTerms(glossaryTerms);
    } catch (error) {
      console.error('Failed to load glossary terms:', error);
      toast.error(`Failed to load glossary terms: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      if (categoryFilter === 'uncategorized') {
        filtered = filtered.filter(term => !term.category || term.category === '');
      } else {
        filtered = filtered.filter(term => term.category === categoryFilter);
      }
    }

    if (confidenceFilter !== 'all') {
      const confidenceThreshold = parseFloat(confidenceFilter);
      filtered = filtered.filter(term => term.confidence && term.confidence >= confidenceThreshold);
    }

    setFilteredTerms(filtered);
  };

  useEffect(() => {
    filterTerms();
  }, [terms, searchTerm, categoryFilter, confidenceFilter]);

  const exportGlossary = () => {
    const csvContent = [
      ['Term', 'Definition', 'Category', 'Confidence', 'Source Columns', 'Synonyms', 'Data Types'],
      ...filteredTerms.map(term => [
        term.term,
        term.definition,
        term.category || '',
        term.confidence ? (term.confidence * 100).toFixed(1) + '%' : '',
        term.source_columns?.join('; ') || '',
        term.synonyms?.join('; ') || '',
        term.data_types?.join('; ') || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glossary_all_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return 'bg-gray-100 text-gray-800';
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleEditTerm = (term: GlossaryTerm) => {
    setEditingTerm({ ...term });
    setIsEditDialogOpen(true);
  };

  const handleSaveTerm = async () => {
    if (!editingTerm || !editingTerm.id) return;

    try {
      await supabaseGlossaryService.updateGlossaryTerm(editingTerm.id, {
        definition: editingTerm.definition,
        category: editingTerm.category,
        synonyms: editingTerm.synonyms,
        confidence: editingTerm.confidence
      });

      // Update the local state
      setTerms(prev => prev.map(term => 
        term.id === editingTerm.id ? { ...term, ...editingTerm } : term
      ));

      toast.success('Term updated successfully!');
      setIsEditDialogOpen(false);
      setEditingTerm(null);
    } catch (error) {
      console.error('Failed to update term:', error);
      toast.error('Failed to update term');
    }
  };

  const handleDeleteTerm = async (termId: number) => {
    if (!confirm('Are you sure you want to delete this term?')) return;

    try {
      await supabaseGlossaryService.deleteGlossaryTerm(termId);
      
      // Update the local state
      setTerms(prev => prev.filter(term => term.id !== termId));
      
      toast.success('Term deleted successfully!');
    } catch (error) {
      console.error('Failed to delete term:', error);
      toast.error('Failed to delete term');
    }
  };

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      

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
                    <SelectItem key={category} value={category || 'uncategorized'}>
                      {category || 'Uncategorized'}
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
                {terms.length === 0 ? 'No glossary terms found in the database' : 'No terms match your filters'}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTerms.map((term, index) => (
                                       <div key={index} className="p-4 border rounded-lg space-y-2">
                       <div className="flex items-start justify-between">
                         <div>
                           <h5 className="font-medium text-lg">{term.term}</h5>
                           {term.dataset_id && (
                             <p className="text-sm text-gray-500">Dataset: {term.dataset_id}</p>
                           )}
                         </div>
                         <div className="flex items-center gap-2">
                           <Badge className={getConfidenceColor(term.confidence)}>
                             {term.confidence ? (term.confidence * 100).toFixed(0) + '%' : 'N/A'} confidence
                           </Badge>
                           {term.category && (
                             <Badge variant="outline">{term.category}</Badge>
                           )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTerm(term)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                                                 <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleDeleteTerm(term.id || 0)}
                           className="text-red-600 hover:text-red-700"
                         >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      {/* Edit Term Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Glossary Term</DialogTitle>
            <DialogDescription>
              Update the definition and metadata for this term.
            </DialogDescription>
          </DialogHeader>
          {editingTerm && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="term-name">Term</Label>
                <Input
                  id="term-name"
                  value={editingTerm.term}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="term-definition">Definition</Label>
                <Textarea
                  id="term-definition"
                  value={editingTerm.definition}
                  onChange={(e) => setEditingTerm(prev => prev ? { ...prev, definition: e.target.value } : null)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="term-category">Category</Label>
                  <Select
                    value={editingTerm.category || 'none'}
                    onValueChange={(value) => setEditingTerm(prev => prev ? { ...prev, category: value === 'none' ? null : value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      <SelectItem value="identifier">Identifier</SelectItem>
                      <SelectItem value="contact_info">Contact Info</SelectItem>
                      <SelectItem value="temporal">Temporal</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="classification">Classification</SelectItem>
                      <SelectItem value="descriptive">Descriptive</SelectItem>
                      <SelectItem value="data_field">Data Field</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="term-confidence">Confidence</Label>
                  <Input
                    id="term-confidence"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={editingTerm.confidence || 0}
                    onChange={(e) => setEditingTerm(prev => prev ? { ...prev, confidence: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="term-synonyms">Synonyms (comma-separated)</Label>
                <Input
                  id="term-synonyms"
                  value={editingTerm.synonyms?.join(', ') || ''}
                  onChange={(e) => setEditingTerm(prev => prev ? { 
                    ...prev, 
                    synonyms: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  } : null)}
                  placeholder="synonym1, synonym2, synonym3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveTerm}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
