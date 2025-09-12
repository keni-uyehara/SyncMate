"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/supabaseClient"
import { improvedGeminiEvaluator } from "@/lib/improvedGeminiEvaluator"

// Define the interface locally to avoid import issues
interface ImprovedRecommendationEvaluation {
  recommendation: string
  context: string
  attainability: number
  relevance: number
  specificity: number
  actionability: number
  impact: number
  risk: number
  overallScore: number
  reasoning: {
    attainability: string
    relevance: string
    specificity: string
    actionability: string
    impact: string
    risk: string
  }
  feedback?: string
  source?: 'manual' | 'compliance_issue'
  issueId?: string
  recommendationIndex?: number
}
import {
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  BarChart3,
  Star,
  Clock,
  Users,
  Activity,
  Zap
} from "lucide-react"

interface EvaluationMetrics {
  totalEvaluations: number
  averageScore: number
  highQualityRecommendations: number
  lowQualityRecommendations: number
  improvementTrend: number
  topPerformingAreas: string[]
  areasForImprovement: string[]
}

export default function AIEvaluationTab() {
  const [evaluations, setEvaluations] = useState<ImprovedRecommendationEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [evaluatingRecommendations, setEvaluatingRecommendations] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<EvaluationMetrics>({
    totalEvaluations: 0,
    averageScore: 0,
    highQualityRecommendations: 0,
    lowQualityRecommendations: 0,
    improvementTrend: 0,
    topPerformingAreas: [],
    areasForImprovement: []
  })

  // Filter state
  const [filterType, setFilterType] = useState<'all' | 'evaluated' | 'not_evaluated'>('all')

  // Evaluation form state
  const [isEvaluateDialogOpen, setIsEvaluateDialogOpen] = useState(false)
  const [evaluationForm, setEvaluationForm] = useState({
    recommendation: "",
    context: ""
  })

  useEffect(() => {
    fetchEvaluations()
  }, [])

  // Filter evaluations based on current filter
  const filteredEvaluations = evaluations.filter(evaluation => {
    const isEvaluated = evaluation.overallScore > 0
    switch (filterType) {
      case 'evaluated':
        return isEvaluated
      case 'not_evaluated':
        return !isEvaluated
      case 'all':
      default:
        return true
    }
  })

  // Update metrics when filter changes
  useEffect(() => {
    calculateMetrics(filteredEvaluations)
  }, [filterType, evaluations])

  const fetchEvaluations = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching evaluations...')
      
      // First, fetch existing evaluations
      const { data: evaluationData, error: evaluationError } = await supabase
        .from('gemini_evaluations')
        .select('*')
        .order('created_at', { ascending: false })

      if (evaluationError) {
        console.error('Error fetching evaluations:', evaluationError)
        // Check if it's a table doesn't exist error
        if (evaluationError.message.includes('relation "gemini_evaluations" does not exist') || 
            evaluationError.message.includes('does not exist')) {
          setError('Database table not found. Please run the database setup script to create the gemini_evaluations table.')
        } else {
          setError(`Database error: ${evaluationError.message}`)
        }
        // Set empty data instead of returning early
        setEvaluations([])
        calculateMetrics([])
        return
      }

      // Then, fetch compliance issues with recommendations
      const { data: complianceData, error: complianceError } = await supabase
        .from('compliance_issues')
        .select('issue_id, insights_system_description, insights_summary, insights_recommendations')
        .not('insights_recommendations', 'is', null)
        .order('date_created', { ascending: false })

      if (complianceError) {
        console.error('Error fetching compliance issues:', complianceError)
      }

      console.log('Fetched evaluations:', evaluationData)
      console.log('Fetched compliance issues:', complianceData)

      // Convert existing evaluation records
      const existingEvaluations = (evaluationData || []).map(record => ({
        recommendation: record.recommendation || '',
        context: record.context || '',
        attainability: record.attainability || 3,
        relevance: record.relevance || 3,
        specificity: record.specificity || 3,
        actionability: record.actionability || 3,
        impact: record.metadata?.impact || 3,
        risk: record.metadata?.risk || 3,
        overallScore: record.overall_score || 3,
        reasoning: record.metadata?.reasoning || {},
        feedback: record.feedback || '',
        source: 'manual'
      }))

      // Convert compliance issue recommendations to evaluation format
      const complianceEvaluations = (complianceData || []).map(issue => {
        const recommendations = issue.insights_recommendations as string[] || []
        return recommendations.map((recommendation, index) => {
          // Check if this recommendation has already been evaluated
          const existingEvaluation = existingEvaluations.find(evaluation => 
            evaluation.recommendation === recommendation && 
            evaluation.context.includes(issue.issue_id)
          )
          
          if (existingEvaluation) {
            // Use the existing evaluation
            return {
              ...existingEvaluation,
              source: 'compliance_issue',
              issueId: issue.issue_id,
              recommendationIndex: index
            }
          }
          
          // Return unevaluated recommendation
          return {
            recommendation: recommendation,
            context: `${issue.insights_system_description || ''} ${issue.insights_summary || ''}`.trim() || `Compliance Issue: ${issue.issue_id}`,
            attainability: 0, // 0 means not evaluated
            relevance: 0,
            specificity: 0,
            actionability: 0,
            impact: 0,
            risk: 0,
            overallScore: 0,
            reasoning: {
              attainability: 'Not yet evaluated',
              relevance: 'Not yet evaluated',
              specificity: 'Not yet evaluated',
              actionability: 'Not yet evaluated',
              impact: 'Not yet evaluated',
              risk: 'Not yet evaluated'
            },
            feedback: 'Recommendation from compliance issue - not yet evaluated by AI',
            source: 'compliance_issue',
            issueId: issue.issue_id,
            recommendationIndex: index
          }
        })
      }).flat()

      // Combine all evaluations - complianceEvaluations already includes existing evaluations
      // so we don't need to add existingEvaluations again
      const allEvaluations = complianceEvaluations
      
      console.log('📊 Total evaluations after deduplication:', allEvaluations.length)
      console.log('📊 Evaluated recommendations:', allEvaluations.filter(e => e.overallScore > 0).length)
      console.log('📊 Not evaluated recommendations:', allEvaluations.filter(e => e.overallScore === 0).length)
      
      setEvaluations(allEvaluations)
      calculateMetrics(allEvaluations)
    } catch (error) {
      console.error('Error fetching evaluations:', error)
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      // Set empty data on error
      setEvaluations([])
      calculateMetrics([])
    } finally {
      setLoading(false)
    }
  }

  const calculateMetrics = (evaluationData: ImprovedRecommendationEvaluation[]) => {
    const total = evaluationData.length
    const averageScore = total > 0 ? evaluationData.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / total : 0
    const highQuality = evaluationData.filter(evaluation => evaluation.overallScore >= 4.0).length
    const lowQuality = evaluationData.filter(evaluation => evaluation.overallScore <= 2.0).length

    // Calculate improvement trend (comparing recent vs older evaluations)
    const recentEvaluations = evaluationData.slice(0, Math.floor(total / 2))
    const olderEvaluations = evaluationData.slice(Math.floor(total / 2))
    const recentAvg = recentEvaluations.length > 0 ? recentEvaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / recentEvaluations.length : 0
    const olderAvg = olderEvaluations.length > 0 ? olderEvaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / olderEvaluations.length : 0
    const improvementTrend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0

    // Analyze performance by dimension
    const dimensionScores = {
      attainability: evaluationData.reduce((sum, evaluation) => sum + evaluation.attainability, 0) / total,
      relevance: evaluationData.reduce((sum, evaluation) => sum + evaluation.relevance, 0) / total,
      specificity: evaluationData.reduce((sum, evaluation) => sum + evaluation.specificity, 0) / total,
      actionability: evaluationData.reduce((sum, evaluation) => sum + evaluation.actionability, 0) / total,
      impact: evaluationData.reduce((sum, evaluation) => sum + evaluation.impact, 0) / total,
      risk: evaluationData.reduce((sum, evaluation) => sum + evaluation.risk, 0) / total
    }

    const sortedDimensions = Object.entries(dimensionScores)
      .sort(([,a], [,b]) => b - a)
      .map(([dimension]) => dimension)

    setMetrics({
      totalEvaluations: total,
      averageScore: Math.round(averageScore * 100) / 100,
      highQualityRecommendations: highQuality,
      lowQualityRecommendations: lowQuality,
      improvementTrend: Math.round(improvementTrend * 100) / 100,
      topPerformingAreas: sortedDimensions.slice(0, 3),
      areasForImprovement: sortedDimensions.slice(-3)
    })
  }

  const handleEvaluateRecommendation = async () => {
    if (!evaluationForm.recommendation.trim() || !evaluationForm.context.trim()) {
      return
    }

    setEvaluating(true)
    try {
      const evaluation = await improvedGeminiEvaluator.evaluateRecommendation(
        evaluationForm.recommendation,
        evaluationForm.context
      )

      // Refresh evaluations list
      await fetchEvaluations()
      
      // Reset form and close dialog
      setEvaluationForm({ recommendation: "", context: "" })
      setIsEvaluateDialogOpen(false)
    } catch (error) {
      console.error('Error evaluating recommendation:', error)
    } finally {
      setEvaluating(false)
    }
  }

  const handleEvaluateComplianceRecommendation = async (evaluation: ImprovedRecommendationEvaluation) => {
    console.log('Button clicked for evaluation:', evaluation)
    
    if (!evaluation.recommendation.trim() || !evaluation.context.trim()) {
      console.log('Missing recommendation or context, skipping evaluation')
      return
    }

    // Create a unique key for this recommendation
    const recommendationKey = `${evaluation.issueId}-${evaluation.recommendationIndex}`
    console.log('Starting evaluation for key:', recommendationKey)
    
    // Add this recommendation to the evaluating set
    setEvaluatingRecommendations(prev => new Set(prev).add(recommendationKey))
    
    try {
      console.log('🔄 UI: Calling improvedGeminiEvaluator.evaluateRecommendation...')
      console.log('📋 UI: Recommendation:', evaluation.recommendation.substring(0, 100) + '...')
      console.log('📋 UI: Context:', evaluation.context.substring(0, 100) + '...')
      
      const aiEvaluation = await improvedGeminiEvaluator.evaluateRecommendation(
        evaluation.recommendation,
        evaluation.context
      )
      
      console.log('✅ UI: Received AI evaluation result:', aiEvaluation)

      // Add the evaluation to the local state immediately and recalculate metrics
      setEvaluations(prev => {
        console.log('Updating evaluations state, current count:', prev.length)
        const updatedEvaluations = prev.map(evaluationItem => {
          if (evaluationItem.issueId === evaluation.issueId && evaluationItem.recommendationIndex === evaluation.recommendationIndex) {
            console.log('Found matching evaluation to update:', evaluationItem.issueId, evaluationItem.recommendationIndex)
            const updated = {
              ...evaluationItem,
              ...aiEvaluation,
              source: 'compliance_issue' as const
            }
            console.log('Updated evaluation:', updated)
            return updated
          }
          return evaluationItem
        })
        
        console.log('Updated evaluations count:', updatedEvaluations.length)
        
        // Recalculate metrics with the updated evaluations
        calculateMetrics(updatedEvaluations)
        
        return updatedEvaluations
      })

      // Skip database refresh since we just updated the local state
      console.log('Skipping database refresh to preserve local state update')
    } catch (error) {
      console.error('Error evaluating compliance recommendation:', error)
      
      // Show user-friendly error message
      if (error instanceof Error && error.message.includes('503')) {
        setError('AI service is temporarily overloaded. Please try again in a few minutes.')
      } else if (error instanceof Error && error.message.includes('overloaded')) {
        setError('AI service is temporarily overloaded. Please try again in a few minutes.')
      } else {
        setError(`Failed to evaluate recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      // Remove this recommendation from the evaluating set
      setEvaluatingRecommendations(prev => {
        const newSet = new Set(prev)
        newSet.delete(recommendationKey)
        return newSet
      })
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 4.0) return 'text-green-600'
    if (score >= 3.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 4.0) return 'bg-green-100 text-green-800'
    if (score >= 3.0) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getDimensionIcon = (dimension: string) => {
    switch (dimension) {
      case 'attainability': return Target
      case 'relevance': return CheckCircle
      case 'specificity': return BarChart3
      case 'actionability': return Zap
      case 'impact': return TrendingUp
      case 'risk': return AlertTriangle
      default: return Activity
    }
  }

  const formatDimensionName = (dimension: string) => {
    return dimension.charAt(0).toUpperCase() + dimension.slice(1)
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <div className="flex-1">
                <p className="font-medium">Error loading evaluations</p>
                <p className="text-sm mb-3">{error}</p>
                {error.includes('Database table not found') && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                    <p className="text-sm text-yellow-800 font-medium">Setup Required:</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      1. Go to your Supabase dashboard<br/>
                      2. Navigate to the SQL Editor<br/>
                      3. Run the SQL commands from the database_setup.sql file<br/>
                      4. Look for the "gemini_evaluations" table creation section
                    </p>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchEvaluations}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvaluations}</div>
            <p className="text-xs text-muted-foreground">
              AI recommendations analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageScore.toFixed(1)}/5.0</div>
            <p className="text-xs text-muted-foreground">
              {metrics.improvementTrend > 0 ? '+' : ''}{metrics.improvementTrend.toFixed(1)}% from baseline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Quality</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.highQualityRecommendations}</div>
            <p className="text-xs text-muted-foreground">
              Score ≥ 4.0 ({metrics.totalEvaluations > 0 ? Math.round((metrics.highQualityRecommendations / metrics.totalEvaluations) * 100) : 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.lowQualityRecommendations}</div>
            <p className="text-xs text-muted-foreground">
              Score ≤ 2.0 ({metrics.totalEvaluations > 0 ? Math.round((metrics.lowQualityRecommendations / metrics.totalEvaluations) * 100) : 0}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Areas</CardTitle>
            <CardDescription>AI excels in these dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topPerformingAreas.map((area, index) => {
                const Icon = getDimensionIcon(area)
                return (
                  <div key={area} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-green-600" />
                      <span className="font-medium">{formatDimensionName(area)}</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      #{index + 1}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
            <CardDescription>Focus areas for AI enhancement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.areasForImprovement.map((area, index) => {
                const Icon = getDimensionIcon(area)
                return (
                  <div key={area} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">{formatDimensionName(area)}</span>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      Priority {index + 1}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evaluation Actions and History */}
      <Tabs defaultValue="evaluations" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="evaluations">Evaluation History</TabsTrigger>
            <TabsTrigger value="analyze">Analyze New</TabsTrigger>
          </TabsList>
          <Button onClick={() => setIsEvaluateDialogOpen(true)}>
            <Brain className="w-4 h-4 mr-2" />
            Evaluate Recommendation
          </Button>
        </div>

        <TabsContent value="evaluations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendation Evaluations</CardTitle>
              <CardDescription>
                Historical analysis of AI recommendation quality and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter Controls */}
              {!loading && evaluations.length > 0 && (
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Filter:</span>
                    <div className="flex gap-1">
                      <Button
                        variant={filterType === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('all')}
                      >
                        All ({evaluations.length})
                      </Button>
                      <Button
                        variant={filterType === 'evaluated' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('evaluated')}
                      >
                        Evaluated ({evaluations.filter(e => e.overallScore > 0).length})
                      </Button>
                      <Button
                        variant={filterType === 'not_evaluated' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('not_evaluated')}
                      >
                        Not Evaluated ({evaluations.filter(e => e.overallScore === 0).length})
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const removed = await improvedGeminiEvaluator.cleanupDuplicateEvaluations()
                      if (removed > 0) {
                        alert(`Cleaned up ${removed} duplicate evaluations. Refreshing...`)
                        fetchEvaluations()
                      } else {
                        alert('No duplicates found')
                      }
                    }}
                  >
                    Clean Duplicates
                  </Button>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-500">Loading evaluations...</span>
                  </div>
                </div>
              ) : filteredEvaluations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">
                    {filterType === 'evaluated' ? 'No evaluated recommendations found' :
                     filterType === 'not_evaluated' ? 'No unevaluated recommendations found' :
                     'No evaluations found'}
                  </p>
                  <p className="text-xs mt-1">
                    {filterType === 'evaluated' ? 'Try evaluating some recommendations first' :
                     filterType === 'not_evaluated' ? 'All recommendations have been evaluated!' :
                     'Start by evaluating an AI recommendation'}
                  </p>
                  {filterType === 'all' && (
                    <Button 
                      onClick={() => setIsEvaluateDialogOpen(true)}
                      className="mt-4"
                      variant="outline"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Evaluate First Recommendation
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvaluations.map((evaluation, index) => (
                    <Card key={index} className={`border-l-4 ${evaluation.source === 'compliance_issue' ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Badge variant={evaluation.source === 'compliance_issue' ? 'secondary' : 'default'}>
                              {evaluation.source === 'compliance_issue' ? 'Compliance Issue' : 'Manual Evaluation'}
                            </Badge>
                            {evaluation.issueId && (
                              <Badge variant="outline" className="text-xs">
                                Issue: {evaluation.issueId}
                              </Badge>
                            )}
                          </div>
                          {evaluation.source === 'compliance_issue' && evaluation.overallScore === 0 && (
                            <Button 
                              size="sm" 
                              onClick={() => handleEvaluateComplianceRecommendation(evaluation)}
                              disabled={evaluatingRecommendations.has(`${evaluation.issueId}-${evaluation.recommendationIndex}`)}
                            >
                              {evaluatingRecommendations.has(`${evaluation.issueId}-${evaluation.recommendationIndex}`) ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Evaluating...
                                </>
                              ) : (
                                <>
                                  <Brain className="w-4 h-4 mr-2" />
                                  Evaluate with AI
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-4">
                            <div>
                              <h4 className="font-semibold text-sm text-gray-900 mb-2">Recommendation</h4>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                {evaluation.recommendation}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-gray-900 mb-2">Context</h4>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                {evaluation.context}
                              </p>
                            </div>
                            {evaluation.feedback && (
                              <div>
                                <h4 className="font-semibold text-sm text-gray-900 mb-2">AI Feedback</h4>
                                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md">
                                  {evaluation.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-4">
                            <div className="text-center">
                              {evaluation.overallScore === 0 ? (
                                <div className="text-3xl font-bold text-gray-400">
                                  Not Evaluated
                                </div>
                              ) : (
                                <div className={`text-3xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                                  {evaluation.overallScore.toFixed(1)}
                                </div>
                              )}
                              <Badge className={evaluation.overallScore === 0 ? 'bg-gray-100 text-gray-600' : getScoreBadgeColor(evaluation.overallScore)}>
                                {evaluation.overallScore === 0 ? 'Not Evaluated' : 'Overall Score'}
                              </Badge>
                            </div>
                            
                            <div className="space-y-3">
                              {evaluation.overallScore === 0 ? (
                                <div className="text-center text-gray-500 text-sm py-4">
                                  Click "Evaluate with AI" to get detailed scores
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Attainability</span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={(evaluation.attainability / 5) * 100} className="w-16 h-2" />
                                      <span className="text-sm font-medium w-6">{evaluation.attainability}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Relevance</span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={(evaluation.relevance / 5) * 100} className="w-16 h-2" />
                                      <span className="text-sm font-medium w-6">{evaluation.relevance}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Specificity</span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={(evaluation.specificity / 5) * 100} className="w-16 h-2" />
                                      <span className="text-sm font-medium w-6">{evaluation.specificity}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Actionability</span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={(evaluation.actionability / 5) * 100} className="w-16 h-2" />
                                      <span className="text-sm font-medium w-6">{evaluation.actionability}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Impact</span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={(evaluation.impact / 5) * 100} className="w-16 h-2" />
                                      <span className="text-sm font-medium w-6">{evaluation.impact}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Risk</span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={(evaluation.risk / 5) * 100} className="w-16 h-2" />
                                      <span className="text-sm font-medium w-6">{evaluation.risk}</span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Performance Analysis</CardTitle>
              <CardDescription>
                Insights and recommendations for improving AI recommendation quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Quality Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>High Quality (≥4.0)</span>
                        <span className="font-medium">{metrics.highQualityRecommendations}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Medium Quality (2.1-3.9)</span>
                        <span className="font-medium">{metrics.totalEvaluations - metrics.highQualityRecommendations - metrics.lowQualityRecommendations}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Low Quality (≤2.0)</span>
                        <span className="font-medium">{metrics.lowQualityRecommendations}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Performance Trend</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Average</span>
                        <span className="font-medium">{metrics.averageScore.toFixed(1)}/5.0</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Improvement</span>
                        <span className={`font-medium ${metrics.improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.improvementTrend >= 0 ? '+' : ''}{metrics.improvementTrend.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Evaluations</span>
                        <span className="font-medium">{metrics.totalEvaluations}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Recommendations for Improvement</h4>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    <li>• Focus on improving {metrics.areasForImprovement[0]} and {metrics.areasForImprovement[1]} scores</li>
                    <li>• Leverage strengths in {metrics.topPerformingAreas[0]} to enhance other areas</li>
                    <li>• Consider providing more specific context when generating recommendations</li>
                    <li>• Review and refine AI prompts based on evaluation feedback</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Evaluate Recommendation Dialog */}
      <Dialog open={isEvaluateDialogOpen} onOpenChange={setIsEvaluateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Evaluate AI Recommendation</DialogTitle>
            <DialogDescription>
              Submit an AI recommendation and its context for quality evaluation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Recommendation</label>
              <Textarea
                value={evaluationForm.recommendation}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, recommendation: e.target.value })}
                placeholder="Enter the AI-generated recommendation to evaluate..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Context</label>
              <Textarea
                value={evaluationForm.context}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, context: e.target.value })}
                placeholder="Describe the context, situation, or problem this recommendation addresses..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEvaluateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEvaluateRecommendation}
                disabled={evaluating || !evaluationForm.recommendation.trim() || !evaluationForm.context.trim()}
              >
                {evaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Evaluate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
