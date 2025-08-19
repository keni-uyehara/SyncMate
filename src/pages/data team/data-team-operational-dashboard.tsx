"use client"

import { useEffect, useState } from "react"
import { summarizeText, generateRecommendations as geminiGenerateRecommendations } from "@/lib/gemini"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KPICard } from "@/components/ui/kpi-card"
import { DashboardHeader } from "@/components/ui/dashboard-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { ActionDropdown } from "@/components/ui/action-dropdown"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/supabaseClient"
import type { Database } from "@/types/database.types"
import { doLogout } from "@/utils/logout"

import {
  AlertTriangle,
  Clock,
  Download,
  Eye,
  FileText,
  Target,
  X,
  CheckCircle,
  BookOpen,
  LogOut,
  Loader2,
} from "lucide-react"

type ComplianceIssue = Database["public"]["Tables"]["compliance_issues"]["Row"]

interface AutoDetectionDetails {
  systemDescription: string
  summary: string
  confidence: number
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

export default function DataTeamOperationalDashboard() {

  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedIssue, setSelectedIssue] = useState<ComplianceIssue | null>(null)
  const [autoDetectionDetails, setAutoDetectionDetails] = useState<AutoDetectionDetails | null>(null)
  const [generatingDetails, setGeneratingDetails] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [summarizer, setSummarizer] = useState<any>(null)
  // Removed unused pipeline loading state
  const rowsPerPage = 6

  // Initialize summarizer: prefer Gemini if configured, otherwise fallback to transformers
  useEffect(() => {
    const initializeSummarization = async () => {
      try {
        if (import.meta.env.VITE_GEMINI_API_KEY) {
          setSummarizer('gemini')
          return
        }
        const { pipeline } = await import('@xenova/transformers')
        const summarizationPipeline = await pipeline("summarization", "Xenova/distilbart-cnn-12-6")
        setSummarizer(summarizationPipeline)
      } catch (error) {
        console.error('Error initializing summarizer:', error)
        setSummarizer('fallback')
      } finally {
      }
    }
    initializeSummarization()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Get total count
        const { count, error: countError } = await supabase
          .from("compliance_issues")
          .select("*", { count: "exact", head: true })
        
        if (countError) {
          console.error("Error fetching count:", countError.message)
          setTotalCount(0)
        } else {
          setTotalCount(count || 0)
        }

        // Get paginated data
        const from = (currentPage - 1) * rowsPerPage
        const to = from + rowsPerPage - 1
        
        const { data, error } = await supabase
          .from("compliance_issues")
          .select("*")
          .order("date_created", { ascending: false })
          .range(from, to)
        
        if (error) {
          console.error("Error fetching compliance issues:", error.message)
          setComplianceIssues([])
        } else {
          setComplianceIssues(data || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setComplianceIssues([])
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentPage])

  const totalPages = Math.ceil(totalCount / rowsPerPage)
  const startItem = totalCount > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0
  const endItem = Math.min(currentPage * rowsPerPage, totalCount)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Generate page numbers with ellipsis for better UX
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page, last page, current page, and neighbors
      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const generateAutoDetectionDetails = async (issue: ComplianceIssue) => {
    setGeneratingDetails(true)
    
    try {
      if (!summarizer || summarizer === 'fallback') {
        console.log('Using fallback generation method')
        const details = generateFallbackDetails(issue)
        setAutoDetectionDetails(details)
        return
      }

      console.log('Using AI summarization for generation')

      // System description = rule-based baseline, polished by summarizer
      const rawDescription = generateSystemDescription(issue)
      console.log('Raw system description:', rawDescription)

      let systemDescription = rawDescription
      if (summarizer === 'gemini') {
        const s = await summarizeText(rawDescription, 120)
        systemDescription = s || rawDescription
      } else if (typeof summarizer === 'function') {
        const systemDescriptionResult = await summarizer(rawDescription)
        systemDescription = systemDescriptionResult[0]?.summary_text || rawDescription
      }
      console.log('Summarized system description:', systemDescription)

      // Summary = summarizer on issue description
      const summaryInput = issue.description || rawDescription
      let summary = generateSummary(issue)
      if (summarizer === 'gemini') {
        const s = await summarizeText(summaryInput, 60)
        summary = s || summary
      } else if (typeof summarizer === 'function') {
        const summaryResult = await summarizer(summaryInput, {
          max_length: 60,
          min_length: 20
        })
        summary = summaryResult[0]?.summary_text || summary
      }
      console.log('Generated summary:', summary)

      // AI-generated recommendations based on specific issue details
      const aiRecommendations = await generateAIRecommendations(issue, summarizer)
      console.log('AI-generated recommendations:', aiRecommendations)

      // Confidence & risk level
      const confidence = calculateConfidence(issue)
      const riskLevel = calculateRisk(issue)

      const details: AutoDetectionDetails = {
        systemDescription,
        summary,
        confidence,
        recommendations: aiRecommendations,
        riskLevel
      }

      console.log('Final auto-detection details:', details)
      setAutoDetectionDetails(details)
    } catch (error) {
      console.error('Error generating auto-detection details:', error)
      const fallbackDetails = generateFallbackDetails(issue)
      setAutoDetectionDetails(fallbackDetails)
    } finally {
      setGeneratingDetails(false)
    }
  }

  const generateAIRecommendations = async (issue: ComplianceIssue, summarizer: any): Promise<string[]> => {
    try {
      // Create a more focused and structured context for AI recommendations
      const recommendationContext = `
        Issue: ${issue.issue_type} for ${issue.entity} (ID: ${issue.issue_id})
        Severity: ${issue.severity || 'Unknown'}
        Current Status: ${issue.status || 'Unknown'}
        Description: ${issue.description || 'No description provided'}
        
        Generate 4 specific, non-redundant recommendations for a data steward to resolve this compliance issue.
        Focus on:
        1. Immediate action to resolve the issue
        2. Process improvement to prevent recurrence
        3. Data quality enhancement
        4. Monitoring and validation
        
        Make each recommendation specific, actionable, and different from the others.
        Avoid generic statements. Be specific to this issue type and entity.
      `

      console.log('Generating focused AI recommendations with context:', recommendationContext)

      // Generate recommendations using Gemini if configured; otherwise use transformers summarizer
      let recommendationsText = ''
      if (summarizer === 'gemini') {
        const recs = await geminiGenerateRecommendations(recommendationContext, 4)
        if (recs && recs.length > 0) return recs
      } else if (typeof summarizer === 'function') {
        const recommendationsResult = await summarizer(recommendationContext, {
          max_length: 250,
          min_length: 80
        })
        recommendationsText = recommendationsResult[0]?.summary_text || ''
      }
      console.log('Raw AI recommendations:', recommendationsText)

      // Parse and clean recommendations
      const recommendations = recommendationsText
        .split(/[\n.!?]+/)
        .map(rec => rec.trim())
        .map(rec => rec.replace(/^\s*[-*•]\s*/, ''))
        .map(rec => rec.replace(/^\d+\.\s*/, ''))
        .map(rec => rec.replace(/^\*\*(.*?)\*\*:?\s*/, '$1: '))
        .map(rec => rec.replace(/\*\*(.*?)\*\*/g, '$1'))
        .filter(rec => rec.length > 15 && rec.length < 200)
        .filter(rec => rec.length > 0)
        .slice(0, 4)

      // If AI didn't generate enough quality recommendations, use structured fallback
      if (recommendations.length < 2) {
        console.log('Using structured fallback recommendations')
        return generateStructuredRecommendations(issue)
      }

      return recommendations
    } catch (error) {
      console.error('Error generating AI recommendations:', error)
      return generateStructuredRecommendations(issue)
    }
  }

  const generateStructuredRecommendations = (issue: ComplianceIssue): string[] => {
    const issueType = issue.issue_type?.toLowerCase() || ''
    const entityName = issue.entity || 'the affected entity'
    const severity = issue.severity?.toLowerCase() || 'medium'

    // Define specific recommendation templates for each issue type
    const recommendationTemplates = {
      duplicate: [
        `Run automated deduplication on ${entityName} customer records using fuzzy matching on email and phone fields`,
        `Implement real-time duplicate detection during ${entityName} data ingestion to prevent future duplicates`,
        `Establish data quality scorecards for ${entityName} to monitor duplicate rates and set alert thresholds`,
        `Create customer master data management process for ${entityName} to maintain single source of truth`
      ],
      mismatch: [
        `Conduct data definition audit for ${entityName} and align with regulatory compliance requirements`,
        `Implement automated data validation rules for ${entityName} to catch definition mismatches during ingestion`,
        `Establish data governance committee for ${entityName} to maintain consistent definitions across systems`,
        `Create data lineage documentation for ${entityName} to track definition changes and their impact`
      ],
      threshold: [
        `Review and recalibrate threshold parameters for ${entityName} based on current market conditions and risk appetite`,
        `Implement dynamic threshold adjustment system for ${entityName} that adapts to changing business conditions`,
        `Set up automated threshold monitoring dashboard for ${entityName} with real-time alerts and escalation`,
        `Establish threshold review and approval workflow for ${entityName} with quarterly validation cycles`
      ],
      policy: [
        `Conduct policy compliance gap analysis for ${entityName} and create remediation roadmap`,
        `Implement policy compliance monitoring system for ${entityName} with automated violation detection`,
        `Establish policy training program for ${entityName} stakeholders with regular certification requirements`,
        `Create policy exception management process for ${entityName} with proper approval and documentation`
      ]
    }

    // Get base recommendations for the issue type
    let recommendations = recommendationTemplates[issueType as keyof typeof recommendationTemplates] || [
      `Investigate root cause of ${issue.issue_type} issue for ${entityName} and document findings`,
      `Implement preventive controls for ${entityName} to avoid similar compliance issues`,
      `Establish monitoring and alerting for ${entityName} to detect early warning signs`,
      `Create standardized resolution procedures for ${entityName} future reference`
    ]

    // Add severity-specific recommendations
    if (severity.includes('high')) {
      recommendations.unshift(`Immediately escalate ${issue.issue_type} issue for ${entityName} to senior management and implement containment measures`)
    } else if (severity.includes('low')) {
      recommendations.push(`Schedule regular review of ${entityName} compliance status to prevent escalation`)
    }

    return recommendations.slice(0, 4)
  }

  // generateFallbackRecommendations removed (unused)

  const calculateConfidence = (issue: ComplianceIssue): number => {
    const dataFields = [issue.issue_type, issue.entity, issue.severity, issue.status, issue.description]
    const filledFields = dataFields.filter(field => field && field.trim().length > 0).length
    return Math.round((filledFields / dataFields.length) * 100)
  }

  const calculateRisk = (issue: ComplianceIssue): 'low' | 'medium' | 'high' => {
    const severity = issue.severity?.toLowerCase() || 'medium'
    if (severity.includes('high')) return 'high'
    if (severity.includes('low')) return 'low'
    return 'medium'
  }

  const generateSystemDescription = (issue: ComplianceIssue): string => {
    const issueType = issue.issue_type?.toLowerCase() || ''
    const entity = issue.entity || 'the system'
    const severity = issue.severity || 'unknown'
    const description = issue.description || 'No specific description provided'
    const assignee = issue.assignee || 'Unassigned'
    const dateCreated = issue.date_created ? new Date(issue.date_created).toLocaleDateString() : 'unknown date'

    if (issueType.includes('duplicate')) {
      return `The system has identified duplicate records for ${entity} with issue ID ${issue.issue_id}. This duplication was detected on ${dateCreated} and affects data integrity. The issue is currently assigned to ${assignee} and has a ${severity} severity level. ${description}`
    }
    
    if (issueType.includes('mismatch')) {
      return `A data definition mismatch has been detected for ${entity} (Issue ID: ${issue.issue_id}). This mismatch was flagged on ${dateCreated} and may cause compliance violations. The issue is assigned to ${assignee} with ${severity} severity. ${description}`
    }
    
    if (issueType.includes('threshold')) {
      return `Threshold violation detected for ${entity} (Issue ID: ${issue.issue_id}). The current values exceed acceptable limits defined in our compliance framework. This issue was created on ${dateCreated}, assigned to ${assignee}, and has ${severity} severity. ${description}`
    }
    
    if (issueType.includes('policy')) {
      return `Policy alignment issue identified for ${entity} (Issue ID: ${issue.issue_id}). The current implementation does not fully comply with established governance policies. Created on ${dateCreated}, assigned to ${assignee}, with ${severity} severity. ${description}`
    }
    
    return `Compliance issue ${issue.issue_id} detected for ${entity} on ${dateCreated}. This issue was flagged during automated monitoring and is currently assigned to ${assignee} with ${severity} severity level. ${description}`
  }

  const generateSummary = (issue: ComplianceIssue): string => {
    const severity = issue.severity?.toLowerCase() || 'medium'
    const entity = issue.entity || 'the system'
    const issueId = issue.issue_id
    const issueType = issue.issue_type || 'compliance issue'
    const assignee = issue.assignee || 'Unassigned'
    
    if (severity.includes('high')) {
      return `Critical ${issueType} (${issueId}) requiring immediate attention for ${entity}. Currently assigned to ${assignee} and flagged as high priority.`
    } else if (severity.includes('low')) {
      return `Minor ${issueType} (${issueId}) detected for ${entity}. Assigned to ${assignee} with standard priority level.`
    } else {
      return `Moderate ${issueType} (${issueId}) identified for ${entity}. Assigned to ${assignee} and requires attention within standard timeframe.`
    }
  }

  const generateRecommendations = (issue: ComplianceIssue): string[] => {
    const severity = issue.severity?.toLowerCase() || 'medium'
    const issueType = issue.issue_type?.toLowerCase() || ''

    let specificRecommendations: string[] = []

    // Issue type-specific recommendations
    if (issueType.includes('duplicate')) {
      specificRecommendations.push('Implement automated deduplication process using "keep most recent" strategy')
      specificRecommendations.push('Establish data quality controls to prevent future duplicate entries')
      specificRecommendations.push('Review customer identification and onboarding processes')
      specificRecommendations.push('Set up real-time duplicate detection alerts')
      specificRecommendations.push('Create data reconciliation procedures between systems')
    }

    if (issueType.includes('mismatch')) {
      specificRecommendations.push('Review and standardize data definitions across all systems')
      specificRecommendations.push('Update data governance policies to align with regulatory requirements')
      specificRecommendations.push('Implement data validation rules to prevent definition mismatches')
      specificRecommendations.push('Establish cross-departmental data definition committees')
      specificRecommendations.push('Create data lineage documentation for affected fields')
    }

    if (issueType.includes('threshold')) {
      specificRecommendations.push('Review and recalibrate threshold settings based on current business metrics')
      specificRecommendations.push('Implement dynamic threshold adjustment based on market conditions')
      specificRecommendations.push('Set up automated threshold monitoring and alerting systems')
      specificRecommendations.push('Establish threshold review and approval workflows')
      specificRecommendations.push('Create threshold performance dashboards for continuous monitoring')
    }

    if (issueType.includes('policy')) {
      specificRecommendations.push('Conduct policy compliance audit and gap analysis')
      specificRecommendations.push('Update operational procedures to align with governance policies')
      specificRecommendations.push('Implement policy compliance monitoring and reporting tools')
      specificRecommendations.push('Establish policy training programs for affected teams')
      specificRecommendations.push('Create policy exception handling and approval processes')
    }

    // Severity-based recommendations
    if (severity.includes('high')) {
      specificRecommendations.unshift('Implement immediate containment measures to prevent issue escalation')
      specificRecommendations.unshift('Establish crisis management protocols for high-severity issues')
    } else if (severity.includes('low')) {
      specificRecommendations.unshift('Schedule regular monitoring to prevent issue recurrence')
    }

    // General issue resolution recommendations
    const generalRecommendations = [
      'Document root cause analysis and resolution steps',
      'Establish preventive measures to avoid similar issues',
      'Set up monitoring and alerting for early detection',
      'Create standardized resolution procedures for future reference'
    ]

    return [...specificRecommendations, ...generalRecommendations].slice(0, 6)
  }

  const generateFallbackDetails = (issue: ComplianceIssue): AutoDetectionDetails => {
    console.log('Generating fallback details for issue:', issue)
    
    const systemDescription = generateSystemDescription(issue)
    const summary = generateSummary(issue)
    const recommendations = generateRecommendations(issue)
    const confidence = calculateConfidence(issue)
    const riskLevel = calculateRisk(issue)

    const details: AutoDetectionDetails = {
      systemDescription,
      summary,
      confidence,
      recommendations,
      riskLevel
    }

    console.log('Generated fallback details:', details)
    return details
  }

  const handleViewAutoDetectionDetails = async (issue: ComplianceIssue) => {
    setSelectedIssue(issue)
    setAutoDetectionDetails(null)
    setIsDialogOpen(true)
    await generateAutoDetectionDetails(issue)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        title="Operational Analytics Dashboard"
        actions={[
          {
            label: "Export Report",
            icon: Download,
            variant: "outline"
          },
          {
            label: "Flag New Issue",
            icon: AlertTriangle,
            variant: "destructive"
          },
          {
            label: "Logout",
            icon: LogOut,
            variant: "outline",
            onClick: () => doLogout(), // <-- add this action
          },
        ]}
      />

      <div className="p-6">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Active Issues"
            value="23"
            icon={AlertTriangle}
            iconColor="text-red-500"
            change={{ value: "+3 from last week", isPositive: false }}
          />
          <KPICard
            title="Resolution Rate"
            value="87%"
            icon={CheckCircle}
            iconColor="text-green-500"
            change={{ value: "+5% from last week", isPositive: true }}
          />
          <KPICard
            title="Avg. Resolution Time"
            value="2.3d"
            icon={Clock}
            iconColor="text-blue-500"
            change={{ value: "-0.5d improvement", isPositive: true }}
          />
          <KPICard
            title="Compliance Score"
            value="94%"
            icon={Target}
            iconColor="text-purple-500"
            progress={94}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="issue-tracking" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="issue-tracking">Issue Tracking</TabsTrigger>
            <TabsTrigger value="resolution-workflows">Resolution Workflows</TabsTrigger>
            <TabsTrigger value="root-cause-analysis">Root Cause Analysis</TabsTrigger>
            <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="data-glossary">Data Glossary</TabsTrigger>
          </TabsList>

          {/* Issue Tracking Tab */}
          <TabsContent value="issue-tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Compliance Issues</CardTitle>
                    <CardDescription>Track and manage flagged compliance issues</CardDescription>
                  </div>
                  <SearchFilterBar
                    searchPlaceholder="Search Issues..."
                    filterOptions={[
                      { value: "high", label: "High Severity" },
                      { value: "medium", label: "Medium Severity" },
                      { value: "low", label: "Low Severity" },
                      { value: "in-progress", label: "In Progress" },
                      { value: "pending", label: "Pending Review" },
                      { value: "resolved", label: "Resolved" }
                    ]}
                    filterLabel="Issues"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">Loading compliance issues...</div>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Issue ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Entity</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Assignee</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {complianceIssues.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                              No compliance issues found
                            </TableCell>
                          </TableRow>
                        ) : (
                          complianceIssues.map((issue, index) => (
                            <TableRow key={`${issue.record_id}-${issue.issue_id}-${index}`}>
                              <TableCell className="font-medium">{issue.issue_id}</TableCell>
                              <TableCell>{issue.issue_type}</TableCell>
                              <TableCell>{issue.entity}</TableCell>
                              <TableCell>
                                <StatusBadge status={issue.severity || "unknown"} variant="severity" />
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={issue.status || "unknown"} variant="status" />
                              </TableCell>
                              <TableCell>{issue.assignee || "Unassigned"}</TableCell>
                              <TableCell>
                                {issue.date_created 
                                  ? new Date(issue.date_created).toLocaleDateString()
                                  : "N/A"
                                }
                              </TableCell>
                              <TableCell>
                                <ActionDropdown
                                  itemId={issue.issue_id}
                                  actions={[
                                    {
                                      label: "View Auto-Detection Details",
                                      icon: Eye,
                                      onClick: () => handleViewAutoDetectionDetails(issue)
                                    },
                                    {
                                      label: "Resolve Duplicates",
                                      icon: FileText,
                                      onClick: () => console.log(`Resolve duplicates for ${issue.issue_id}`)
                                    },
                                    {
                                      label: "Dismiss Issue",
                                      icon: X,
                                      onClick: () => console.log(`Dismiss issue ${issue.issue_id}`),
                                      variant: "destructive"
                                    }
                                  ]}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalCount > 0 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-500">
                          Showing {startItem} to {endItem} of {totalCount} results
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                          >
                            ← Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, index) => (
                              page === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                                  ...
                                </span>
                              ) : (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(page as number)}
                                >
                                  {page}
                                </Button>
                              )
                            ))}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => handlePageChange(currentPage + 1)}
                          >
                            Next →
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resolution Workflows Tab */}
          <TabsContent value="resolution-workflows" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Workflows */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Workflows</CardTitle>
                  <CardDescription>
                    Current resolution processes in progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Workflow 1 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">COMP-001: Data Reconciliation</p>
                        <p className="text-xs text-gray-600">
                          Step 2 of 4: Field mapping validation
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                  </div>

                  {/* Workflow 2 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">COMP-002: Policy Alignment</p>
                        <p className="text-xs text-gray-600">
                          Step 1 of 3: Stakeholder review
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                  </div>

                  {/* Workflow 3 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">COMP-003: Threshold Update</p>
                        <p className="text-xs text-gray-600">
                          Completed: All steps verified
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Revised</Badge>
                  </div>

                  {/* Workflow 4 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">COMP-004: Data Reconciliation</p>
                        <p className="text-xs text-gray-600">
                          Completed: All steps verified
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Revised</Badge>
                  </div>

                </CardContent>
              </Card>

              {/* Steward Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Steward Activity</CardTitle>
                  <CardDescription>
                    Data steward engagement and activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Steward 1 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">M</div>
                      <div>
                        <p className="font-medium text-sm">Maria Santos</p>
                        <p className="text-xs text-gray-600">Resolved 3 issues this week</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Active</Badge>
                  </div>

                  {/* Steward 2 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">J</div>
                      <div>
                        <p className="font-medium text-sm">John Cruz</p>
                        <p className="text-xs text-gray-600">2 pending reviews</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Review</Badge>
                  </div>

                  {/* Steward 3 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold">A</div>
                      <div>
                        <p className="font-medium text-sm">Ana Reyes</p>
                        <p className="text-xs text-gray-600">Updated 5 definitions</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Updated</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          {/* Root Cause Analysis Tab */}
          <TabsContent value="root-cause-analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issue Trends */}
              <Card className="col-span-1 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Issue Trends</CardTitle>
                  <CardDescription>
                    Compliance issues patterns over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed rounded-lg flex items-center justify-center h-48 text-center text-gray-500">
                    <div>
                      <p className="font-medium">📈 Trend visualizations would appear here</p>
                      <p className="text-xs">Integration with D3.js / Recharts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Issues Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Issues Categories</CardTitle>
                  <CardDescription>
                    Most common compliance issues
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Duplicate Records", value: 65 },
                    { label: "Definition Mismatch", value: 45 },
                    { label: "Outdated Thresholds", value: 30 },
                    { label: "Policy Conflicts", value: 20 },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.label}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-black h-3 rounded-full"
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Entity Collaboration Health */}
            <Card>
              <CardHeader>
                <CardTitle>Entity Collaboration Health</CardTitle>
                <CardDescription>
                  Cross-entity data alignment status
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { entity: "BPI x Ayala Land", value: 92, issues: 3 },
                  { entity: "BPI x Globe", value: 78, issues: 7 },
                  { entity: "BPI x AC Energy", value: 95, issues: 1 },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.entity}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-black h-3 rounded-full"
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {item.issues} Active {item.issues === 1 ? "issue" : "issues"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Audit Trail Tab */}
          <TabsContent value="audit-trail" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>
                  Complete history of compliance actions and changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Entry 1 */}
                <div className="flex justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                    <div>
                      <p className="font-medium text-sm">
                        Issue COMP-003 Resolved
                      </p>
                      <p className="text-xs text-gray-600">
                        Ana Reyes updated credit scoring threshold for AC Energy green loans
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">Threshold Update</Badge>
                        <Badge variant="outline">BPI x AC Energy</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">2 Hours ago</p>
                </div>

                {/* Entry 2 */}
                <div className="flex justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                    <div>
                      <p className="font-medium text-sm">
                        Workflow Completed
                      </p>
                      <p className="text-xs text-gray-600">
                        Maria Santos completed field mapping validation for COMP-001
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">Data Reconciliation</Badge>
                        <Badge variant="outline">BPI x Ayala Land</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">4 Hours ago</p>
                </div>

                {/* Entry 3 */}
                <div className="flex justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1"></div>
                    <div>
                      <p className="font-medium text-sm">
                        New Issue Flagged
                      </p>
                      <p className="text-xs text-gray-600">
                        System detected SME classification inconsistency between BPI and Globe
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">Definition Mismatch</Badge>
                        <Badge variant="outline">BPI x Globe</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">6 Hours ago</p>
                </div>
              </CardContent>
              {/* Pagination */}
              <div className="flex justify-center mt-4 mb-8">
                <nav className="flex items-center gap-2 text-sm">
                  <button className="px-2 py-1 text-gray-400 cursor-not-allowed">
                    ← Previous
                  </button>
                  <button className="px-3 py-1 bg-black text-white rounded">1</button>
                  <button className="px-3 py-1 border rounded">2</button>
                  <button className="px-3 py-1 border rounded">3</button>
                  <span>…</span>
                  <button className="px-3 py-1 border rounded">67</button>
                  <button className="px-3 py-1 border rounded">68</button>
                  <button className="px-2 py-1">Next →</button>
                </nav>
              </div>
            </Card>
          </TabsContent>


          {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Generated Compliance Report */}
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Generated Compliance Report</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      🔄 Regenerate
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      📤 Export
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-sm text-gray-600">
                  AI analysis of current compliance landscape and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                {/* Executive Summary */}
                <div>
                  <h4 className="font-semibold text-purple-600 mb-2 text-base">Executive Summary</h4>
                  <p className="text-gray-700 leading-relaxed">
                    Based on analysis of 32 compliance issues across BPI and Ayala companies, the system has identified
                    three critical patterns requiring immediate attention. The primary concern involves duplicate
                    customer records between BPI and Ayala Land housing loan applications, affecting 15% of joint
                    applications impacting regulatory reporting accuracy.
                  </p>
                </div>

                {/* High Priority Recommendations */}
                <div className="border-l-4 border-red-500 pl-4 bg-red-50/50 py-3 rounded-r-lg">
                  <h4 className="font-semibold text-red-600 mb-2 text-base">High Priority Recommendations</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                    <li>Implement automated Customer ID reconciliation between BPI and Ayala Land Systems</li>
                    <li>Establish unified SME classification criteria across Globe and BPI partnerships</li>
                    <li>Update credit scoring threshold for green energy loans with AC Energy within 48 hours</li>
                  </ul>
                </div>

                {/* Medium Priority Actions */}
                <div className="border-l-4 border-yellow-500 pl-4 bg-yellow-50/50 py-3 rounded-r-lg">
                  <h4 className="font-semibold text-yellow-600 mb-2 text-base">Medium Priority Actions</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                    <li>Standardise data glossary across all Ayala Companies (estimated 2 weeks effort)</li>
                    <li>Implement quarterly policy alignment reviews to prevent threshold drift</li>
                    <li>Enhance steward training on cross-entity data validation procedures</li>
                  </ul>
                </div>

                {/* Strategic Opportunities */}
                <div className="border-l-4 border-green-500 pl-4 bg-green-50/50 py-3 rounded-r-lg">
                  <h4 className="font-semibold text-green-600 mb-2 text-base">Strategic Opportunities</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                    <li>87% data alignment with Ayala Land enables expansion of joint housing products</li>
                    <li>Improved Globe integration could unlock telco-banking synergies for 2.3M customers</li>
                    <li>AC Energy partnerships shows potential ESG-compliant lending for portfolio growth</li>
                  </ul>
                </div>

                {/* Predicted Impact */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3 text-base">Predicted Impact</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-blue-600 font-medium mb-1">Resolution Time Reduction:</p>
                      <p className="font-bold text-lg text-blue-700">-35%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-blue-600 font-medium mb-1">Compliance Score Improvement:</p>
                      <p className="font-bold text-lg text-blue-700">-35%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-blue-600 font-medium mb-1">Cross-Entity Synergy Score:</p>
                      <p className="font-bold text-lg text-blue-700">+12%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-blue-600 font-medium mb-1">Risk Mitigation:</p>
                      <p className="font-bold text-lg text-blue-700">+12%</p>
                    </div>
                  </div>
                </div>

                {/* Report Footer */}
                <p className="text-xs text-gray-500 pt-2 border-t">
                  Report generated on January 15, 2024 at 2:30 PM | Confidence Score: 94% | Based on 1,247 data points
                  across 5 entities
                </p>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">🤖</div>
                  <div>
                    <CardTitle className="text-lg font-semibold">SyncMate AI Assistant</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Ask questions about compliance issues and get insights
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assistant messages */}
                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    <div className="flex-none w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs leading-none">
                      🤖
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                      <p className="text-gray-700 leading-relaxed">
                        Hello! I'm your SyncMate AI assistant. I can help you analyze compliance issues,
                        explain resolution workflows, and provide insights about cross-entity data alignment.
                        What would you like to know?
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end justify-end gap-2">
                    <div className="bg-gray-200 p-3 rounded-lg text-sm">
                      <div className="flex items-start gap-2">
                        <p className="text-gray-600 text-xs">
                          What's causing the duplicate records issue with Ayala Land?
                        </p>
                      </div>
                    </div>
                    <div className="flex-none w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs leading-none">
                      👤
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-none w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs leading-none">
                      🤖
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                      <div className="flex items-start gap-2">
                        <p className="text-gray-700 leading-relaxed">
                          The duplicate records issue (COMP-001) stems from different customer ID formats between BPI's
                          core banking system and Ayala Land's CRM.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input area */}
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask me about compliance issues, resolution strategies, or data insights..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button size="sm" className="px-3">
                      ➤
                    </Button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">Quick Actions:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      Explain COMP-001
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      Resolution Timeline
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      Risk Assessment
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      Best Practices
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policy Alignment Simulation */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Policy Alignment Simulation</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  AI-powered impact analysis of policy changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-green-800">Scenario: Unified SME Definition</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-600">Predicted Outcome:</p>
                        <p className="font-medium text-green-700">23% reduction in classification conflicts</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Affected Records:</p>
                        <p className="font-medium text-green-700">~45,000 customer profiles</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Implementation Effort:</p>
                        <p className="font-medium text-green-700">3-4 weeks</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Compliance Impact:</p>
                        <p className="font-medium text-green-700">+15% alignment score</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="w-full bg-black text-white">
                  Run New Simulation
                </Button>
              </CardContent>
            </Card>

            {/* Collaboration Readiness Score */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Collaboration Readiness Score</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  AI-powered impact analysis of policy changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">BPI ↔ Ayala Land</span>
                      <span className="font-bold text-lg">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">BPI ↔ Globe</span>
                      <span className="font-bold text-lg">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">BPI ↔ AC Energy</span>
                      <span className="font-bold text-lg">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>

                <p className="text-xs text-gray-500 pt-2 border-t">
                  Scores are based on data alignment, policy compatibility, and historical collaboration success
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>




          {/* Data Glossary Tab */}
          <TabsContent value="data-glossary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Glossary</CardTitle>
                <CardDescription>Standardized definitions and data governance framework</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Data glossary and governance tools would appear here</p>
                    <p className="text-sm text-gray-400">Standardized definitions, data lineage, and governance policies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Auto-Detection Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Auto-Detection Details: {selectedIssue?.issue_id}
            </DialogTitle>
            <DialogDescription>
              System-generated compliance issue detected on {selectedIssue?.date_created ? new Date(selectedIssue.date_created).toLocaleDateString() : 'Unknown date'}.
            </DialogDescription>
          </DialogHeader>

          {selectedIssue && (
            <div className="space-y-6">
              {/* Issue Overview */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-600">Issue Type</p>
                  <p>{selectedIssue.issue_type}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Affected Entity</p>
                  <p>{selectedIssue.entity}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Severity</p>
                  <StatusBadge status={selectedIssue.severity || "unknown"} variant="severity" />
                </div>
                <div>
                  <p className="font-medium text-gray-600">Detection Confidence</p>
                  <span className="text-green-600 font-semibold">94%</span>
                </div>
              </div>

              {/* AI Analysis */}
              {generatingDetails ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating AI analysis...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : autoDetectionDetails ? (
                <div className="space-y-4">
                  {/* System Analysis */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-lg mb-3">System Analysis</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Description:</span>
                        <span className="ml-2 text-gray-700">
                          {autoDetectionDetails.systemDescription}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Detected Method:</span>
                        <span className="ml-2 text-gray-700">
                          {selectedIssue.issue_type?.toLowerCase().includes('duplicate') 
                            ? 'Fuzzy matching algorithm on customer identifiers'
                            : 'Automated compliance monitoring system'
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Affected Records:</span>
                        <span className="ml-2 text-gray-700">
                          {selectedIssue.issue_type?.toLowerCase().includes('duplicate') ? '275' : '1'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* System Recommendation */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-lg mb-3">System Recommendation</h3>
                    <p className="text-gray-700">
                      {selectedIssue.issue_type?.toLowerCase().includes('duplicate') 
                        ? "Apply automated deduplication using 'keep most recent' strategy with transaction history preservation."
                        : autoDetectionDetails.recommendations[0] || "Review and resolve the compliance issue according to standard procedures."
                      }
                    </p>
                  </div>

                  {/* Duplicate Analysis (only show for duplicate issues) */}
                  {selectedIssue.issue_type?.toLowerCase().includes('duplicate') && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Duplicate Analysis</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Total Duplicates Found:</span>
                          <span className="ml-2 text-red-600 font-semibold">275</span>
                        </div>
                        <div>
                          <span className="font-medium">Matching Criteria:</span>
                          <span className="ml-2 text-gray-700">Same customer_id, email, and phone number</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sample Duplicates (only show for duplicate issues) */}
                  {selectedIssue.issue_type?.toLowerCase().includes('duplicate') && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Sample Duplicates:</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">John Smith</p>
                            <p className="text-sm text-gray-600">john@email.com</p>
                          </div>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            3 Duplicates
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Maria Santos</p>
                            <p className="text-sm text-gray-600">maria.santos@email.com</p>
                          </div>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            2 Duplicates
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Recommendations */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Additional Recommendations</h3>
                    <ul className="space-y-2">
                      {autoDetectionDetails.recommendations.slice(1).map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risk Assessment */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-lg mb-3">Risk Assessment</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Risk Level:</span>
                        <Badge 
                          variant={autoDetectionDetails.riskLevel === 'high' ? 'destructive' : 
                                 autoDetectionDetails.riskLevel === 'medium' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {autoDetectionDetails.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Confidence Score:</span>
                        <span className="ml-2 font-semibold">{autoDetectionDetails.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
