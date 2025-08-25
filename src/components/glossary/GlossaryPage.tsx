import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { GlossaryExtractor } from './GlossaryExtractor';
import { GlossaryViewer } from './GlossaryViewer';
import type { GlossaryTerm } from '../../lib/glossaryService';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Database, FileText, BookOpen } from 'lucide-react';

export const GlossaryPage: React.FC = () => {
  const [currentDatasetId, setCurrentDatasetId] = useState('');
  const [extractedTerms, setExtractedTerms] = useState<GlossaryTerm[]>([]);

  const handleTermsExtracted = (terms: GlossaryTerm[]) => {
    setExtractedTerms(terms);
    // Optionally refresh the viewer
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Data Glossary Management
          </CardTitle>
          <CardDescription>
            Extract business terms from your data files and manage your data glossary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="datasetId">Dataset ID</Label>
              <Input
                id="datasetId"
                value={currentDatasetId}
                onChange={(e) => setCurrentDatasetId(e.target.value)}
                placeholder="Enter dataset identifier (e.g., customer_data_2024)"
                className="max-w-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="extract" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="extract" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Extract Terms
          </TabsTrigger>
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            View Glossary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="extract" className="space-y-6">
          <GlossaryExtractor
            datasetId={currentDatasetId}
            onTermsExtracted={handleTermsExtracted}
          />
        </TabsContent>

        <TabsContent value="view" className="space-y-6">
          <GlossaryViewer datasetId={currentDatasetId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
