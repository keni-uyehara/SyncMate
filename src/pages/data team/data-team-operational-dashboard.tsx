"use client"

import { useEffect, useState } from "react"
import { summarizeText, generateRecommendations as geminiGenerateRecommendations, getGeminiModel } from "@/lib/gemini"
import { auth } from "@/firebaseConfig"
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
import { ComplianceCharts } from "@/components/ui/compliance-charts"
import { Pagination } from "@/components/ui/pagination"
import { supabase } from "@/supabaseClient"
import type { Database } from "@/types/database.types"
import { doLogout } from "@/utils/logout"
import { SimpleGlossaryTab } from "@/components/glossary/SimpleGlossaryTab"

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

import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select"

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
  const [users, setUsers] = useState<Database['public']['Tables']['users']['Row'][]>([])
  const [teamMembers, setTeamMembers] = useState<Database['public']['Tables']['team_members']['Row'][]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedIssue, setSelectedIssue] = useState<ComplianceIssue | null>(null)
  const [autoDetectionDetails, setAutoDetectionDetails] = useState<AutoDetectionDetails | null>(null)
  const [generatingDetails, setGeneratingDetails] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [summarizer, setSummarizer] = useState<any>(null)
  // Removed unused pipeline loading state
  const rowsPerPage = 5

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedEntity, setSelectedEntity] = useState("all")
  const [selectedIssueType, setSelectedIssueType] = useState("all")

  // Helper function to get unique entities from compliance issues
  const getUniqueEntities = (): string[] => {
    const entities = new Set<string>()
    complianceIssues.forEach(issue => {
      if (issue.entity) {
        entities.add(issue.entity)
      }
    })
    return Array.from(entities).sort()
  }

  // Helper function to get unique issue types from compliance issues
  const getUniqueIssueTypes = (): string[] => {
    const issueTypes = new Set<string>()
    complianceIssues.forEach(issue => {
      if (issue.issue_type) {
        issueTypes.add(issue.issue_type)
      }
    })
    return Array.from(issueTypes).sort()
  }

  // Helper function to filter compliance issues
  const getFilteredIssues = (): ComplianceIssue[] => {
    return complianceIssues.filter(issue => {
      // Search filter
      const searchMatch = !searchTerm || 
        issue.issue_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.issue_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getAssigneeName(issue.assignee).toLowerCase().includes(searchTerm.toLowerCase())

      // Severity/Status filter
      let filterMatch = true
      if (selectedFilter !== "all") {
        if (selectedFilter === "high" || selectedFilter === "medium" || selectedFilter === "low") {
          filterMatch = issue.severity?.toLowerCase() === selectedFilter
        } else if (selectedFilter === "in-progress") {
          filterMatch = issue.status === "In Progress"
        } else if (selectedFilter === "pending") {
          filterMatch = issue.status === "Open"
        } else if (selectedFilter === "resolved") {
          filterMatch = issue.status === "Closed"
        }
      }

      // Entity filter
      const entityMatch = selectedEntity === "all" || issue.entity === selectedEntity

      // Issue type filter
      const issueTypeMatch = selectedIssueType === "all" || issue.issue_type === selectedIssueType

      return searchMatch && filterMatch && entityMatch && issueTypeMatch
    })
  }

  // Helper function to resolve Firebase UID to user name
  const getAssigneeName = (firebaseUid: string | null) => {
    if (!firebaseUid) return 'Unassigned'
    const user = users.find(u => u.firebase_uid === firebaseUid)
    // Prioritize name, then email, and only show UID if neither is available
    if (user?.name && user.name.trim() !== '') {
      return user.name
    }
    if (user?.email && user.email.trim() !== '') {
      return user.email
    }
    // Only show UID if no name or email is available
    return firebaseUid
  }

  // Helper function to format dates consistently
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid Date"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return "Invalid Date"
    }
  }

  // Function to get current user and role
  const getCurrentUserAndRole = async () => {
    const user = auth.currentUser
    if (user) {
      setCurrentUser(user)
      
      // Get user role from Supabase
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('firebase_uid', user.uid)
        .single()
      
      if (!error && userData) {
        setCurrentUserRole(userData.role)
      }
    }
  }

  // AI Insights state
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiExecutiveSummary, setAiExecutiveSummary] = useState<string>("")
  const [aiHighPriority, setAiHighPriority] = useState<string[]>([])
  const [aiMediumPriority, setAiMediumPriority] = useState<string[]>([])
  const [aiStrategicOpportunities, setAiStrategicOpportunities] = useState<string[]>([])
  const [aiImpact, setAiImpact] = useState<{ resolutionTimeReductionPercent: number; complianceScoreImprovementPercent: number; synergyScoreDeltaPercent: number; riskMitigationDeltaPercent: number } | null>(null)
  const [aiGeneratedAt, setAiGeneratedAt] = useState<string>("")
  const [aiInsightsId, setAiInsightsId] = useState<string | null>(null)

  // Issue Resolution state
  const [isResolutionDialogOpen, setIsResolutionDialogOpen] = useState(false)
  const [resolutionIssue, setResolutionIssue] = useState<ComplianceIssue | null>(null)
  const [resolutionStep, setResolutionStep] = useState<'analysis' | 'action' | 'verification' | 'complete'>('analysis')
  const [resolutionActions, setResolutionActions] = useState<string[]>([])
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [resolutionStatus, setResolutionStatus] = useState<'pending' | 'in-progress' | 'Closed' | 'failed'>('pending')
  const [resolutionLoading, setResolutionLoading] = useState(false)
  const [resolutionSuccess, setResolutionSuccess] = useState(false)

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
        // Get current user and role first
        await getCurrentUserAndRole()
        
        // Fetch users for assignee resolution
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
        
        if (usersError) {
          console.error('Error fetching users:', usersError)
        } else {
          setUsers(usersData || [])
        }

        // Fetch data team members for steward activity
        const { data: teamMembersData, error: teamMembersError } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'dataTeam')
          .order('last_login_at', { ascending: false })
        
        if (teamMembersError) {
          console.error('Error fetching team members:', teamMembersError)
        } else {
          // Transform users data to match team_members structure
          const transformedTeamMembers = (teamMembersData || []).map(user => ({
            id: user.firebase_uid,
            firebase_uid: user.firebase_uid,
            name: user.name || user.email || 'Unknown User',
            email: user.email || '',
            role: 'data_analyst' as const,
            status: 'active' as const,
            last_active: user.last_login_at,
            assigned_issues: 0, // Will be calculated from compliance issues
            performance: 85, // Default performance score
            created_at: user.created_at,
            updated_at: user.last_login_at || user.created_at
          }))
          setTeamMembers(transformedTeamMembers)
        }

        // Build query based on user role
        let query = supabase
          .from("compliance_issues")
          .select("*")
          .order("issue_id", { ascending: true })

        // Filter based on user role
        if (currentUserRole === 'dataTeamLead' || currentUserRole === 'teamLead') {
          // Data team leads and team leads see all issues
          console.log('User is a lead - showing all issues')
        } else {
          // Regular data team members only see issues assigned to them
          if (currentUser?.uid) {
            query = query.eq('assignee', currentUser.uid)
            console.log('User is data team member - showing only assigned issues')
          }
        }

        // Get total count with same filtering
        let countQuery = supabase
          .from("compliance_issues")
          .select("*", { count: "exact", head: true })

        if (currentUserRole !== 'dataTeamLead' && currentUserRole !== 'teamLead' && currentUser?.uid) {
          countQuery = countQuery.eq('assignee', currentUser.uid)
        }

        const { count, error: countError } = await countQuery
        
        if (countError) {
          console.error("Error fetching count:", countError.message)
          setTotalCount(0)
        } else {
          setTotalCount(count || 0)
        }

        // Get paginated data
        const from = (currentPage - 1) * rowsPerPage
        const to = from + rowsPerPage - 1
        
        const { data, error } = await query.range(from, to)
        
        if (error) {
          console.error("Error fetching compliance issues:", error.message)
          setComplianceIssues([])
        } else {
          setComplianceIssues(data || [])
          
          // Create audit trail entries for newly loaded issues
          if (data && data.length > 0) {
            for (const issue of data) {
              // Create audit entry for issue creation (if it's a new issue)
              if (issue.date_created) {
                const createdDate = new Date(issue.date_created)
                const now = new Date()
                const hoursSinceCreated = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60)
                
                // Only create audit entry if issue was created in the last 24 hours
                if (hoursSinceCreated <= 24) {
                  await createAuditEntry('issue_created', {
                    issue_id: issue.issue_id,
                    issue_type: issue.issue_type,
                    entity: issue.entity,
                    severity: issue.severity,
                    description: `System detected ${issue.issue_type} issue for ${issue.entity}`
                  })
                }
              }
              
              // Create audit entry for status updates
              if (issue.status === 'In Progress' && currentUser?.uid === issue.assignee) {
                await createAuditEntry('issue_status_updated', {
                  issue_id: issue.issue_id,
                  issue_type: issue.issue_type,
                  entity: issue.entity,
                  old_status: 'Open',
                  new_status: 'In Progress',
                  updated_by: currentUser?.displayName || currentUser?.email || 'Unknown User',
                  severity: issue.severity,
                  description: `Issue status changed to In Progress by ${currentUser?.displayName || currentUser?.email}`
                })
              }
            }
          }
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
  }, [currentPage, currentUserRole, currentUser?.uid])

  // Pagination for filtered results
  const filteredIssues = getFilteredIssues()
  const filteredTotalPages = Math.ceil(filteredIssues.length / rowsPerPage)
  const filteredStartItem = filteredIssues.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0
  const filteredEndItem = Math.min(currentPage * rowsPerPage, filteredIssues.length)
  
  // Get paginated filtered issues
  const paginatedFilteredIssues = filteredIssues.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedFilter, selectedEntity, selectedIssueType])

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
      // Persist generated insights to Supabase for this issue
      const { error: updateError } = await supabase
        .from("compliance_issues")
        .update({
          insights_system_description: details.systemDescription,
          insights_summary: details.summary,
          insights_recommendations: details.recommendations,
          insights_risk_level: details.riskLevel,
          insights_confidence: details.confidence,
          insights_model: summarizer === "gemini" ? "gemini-1.5-flash" : "distilbart-cnn-12-6",
          insights_generated_at: new Date().toISOString(),
        } as any)
        .eq("issue_id", issue.issue_id)

      if (updateError) {
        console.error("Error saving insights to Supabase:", updateError.message)
      }
      setAutoDetectionDetails(details)
    } catch (error) {
      console.error('Error generating auto-detection details:', error)
      const fallbackDetails = generateFallbackDetails(issue)
      setAutoDetectionDetails(fallbackDetails)
    } finally {
      setGeneratingDetails(false)
    }
  }

  // Helper function to clean up recommendation text
  const cleanRecommendationText = (text: string): string => {
    return text
      .replace(/::/g, ': ') // Replace double colons with single colon and space
      .replace(/:\s*:/g, ': ') // Replace colon followed by whitespace and colon with single colon
      .replace(/^\s*[-*•]\s*/, '') // Remove leading bullet points
      .replace(/^\d+\.\s*/, '') // Remove leading numbers
      .replace(/^\*\*(.*?)\*\*:?\s*/, '$1: ') // Clean up markdown bold formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove remaining markdown bold
      .trim()
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
        
        IMPORTANT FORMATTING RULES:
        - Do NOT use double colons (::) anywhere in your recommendations
        - Use single colons (:) only when necessary for clarity
        - Write recommendations as clear, complete sentences
        - Do not use bullet points, numbers, or special formatting characters
        - Each recommendation should be a standalone, actionable statement
      `

      console.log('Generating focused AI recommendations with context:', recommendationContext)

      // Generate recommendations using Gemini if configured; otherwise use transformers summarizer
      let recommendationsText = ''
      if (summarizer === 'gemini') {
        const recs = await geminiGenerateRecommendations(recommendationContext, 4)
        if (recs && recs.length > 0) {
          // Clean up the recommendations
          return recs.map(rec => cleanRecommendationText(rec))
        }
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
        .map(rec => cleanRecommendationText(rec))
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
    const assigneeName = getAssigneeName(issue.assignee)
    const dateCreated = formatDate(issue.date_created) || 'unknown date'

    if (issueType.includes('duplicate')) {
      return `The system has identified duplicate records for ${entity} with issue ID ${issue.issue_id}. This duplication was detected on ${dateCreated} and affects data integrity. The issue is currently assigned to ${assigneeName} and has a ${severity} severity level. ${description}`
    }
    
    if (issueType.includes('mismatch')) {
      return `A data definition mismatch has been detected for ${entity} (Issue ID: ${issue.issue_id}). This mismatch was flagged on ${dateCreated} and may cause compliance violations. The issue is assigned to ${assigneeName} with ${severity} severity. ${description}`
    }
    
    if (issueType.includes('threshold')) {
      return `Threshold violation detected for ${entity} (Issue ID: ${issue.issue_id}). The current values exceed acceptable limits defined in our compliance framework. This issue was created on ${dateCreated}, assigned to ${assigneeName}, and has ${severity} severity. ${description}`
    }
    
    if (issueType.includes('policy')) {
      return `Policy alignment issue identified for ${entity} (Issue ID: ${issue.issue_id}). The current implementation does not fully comply with established governance policies. Created on ${dateCreated}, assigned to ${assigneeName}, with ${severity} severity. ${description}`
    }
    
    return `Compliance issue ${issue.issue_id} detected for ${entity} on ${dateCreated}. This issue was flagged during automated monitoring and is currently assigned to ${assigneeName} with ${severity} severity level. ${description}`
  }

  const generateSummary = (issue: ComplianceIssue): string => {
    const severity = issue.severity?.toLowerCase() || 'medium'
    const entity = issue.entity || 'the system'
    const issueId = issue.issue_id
    const issueType = issue.issue_type || 'compliance issue'
    const assigneeName = getAssigneeName(issue.assignee)
    
    if (severity.includes('high')) {
      return `Critical ${issueType} (${issueId}) requiring immediate attention for ${entity}. Currently assigned to ${assigneeName} and flagged as high priority.`
    } else if (severity.includes('low')) {
      return `Minor ${issueType} (${issueId}) detected for ${entity}. Assigned to ${assigneeName} with standard priority level.`
    } else {
      return `Moderate ${issueType} (${issueId}) identified for ${entity}. Assigned to ${assigneeName} and requires attention within standard timeframe.`
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

  const mapRowToAutoDetectionDetails = (row: any): AutoDetectionDetails | null => {
    const systemDescription = row?.insights_system_description as string | undefined
    const summary = row?.insights_summary as string | undefined
    const recommendationsRaw = row?.insights_recommendations as unknown
    const riskLevel = row?.insights_risk_level as 'low' | 'medium' | 'high' | undefined
    const confidence = row?.insights_confidence as number | undefined

    if (!systemDescription || !summary || !riskLevel || typeof confidence !== 'number') {
      return null
    }

    let recommendations: string[] = []
    if (Array.isArray(recommendationsRaw)) {
      recommendations = recommendationsRaw as string[]
    } else if (typeof recommendationsRaw === 'string') {
      try {
        const parsed = JSON.parse(recommendationsRaw)
        if (Array.isArray(parsed)) recommendations = parsed
      } catch {
        // ignore parse errors, keep empty array
      }
    }

    return {
      systemDescription,
      summary,
      confidence,
      recommendations,
      riskLevel,
    }
  }

  const loadOrGenerateInsights = async (issue: ComplianceIssue) => {
    // Try to load from Supabase first; if not found, generate and save
    setGeneratingDetails(true)
    try {
      const { data, error } = await supabase
        .from('compliance_issues')
        .select('*')
        .eq('issue_id', issue.issue_id)
        .limit(1)
        .single()

      if (!error && data) {
        const fromDb = mapRowToAutoDetectionDetails(data as any)
        if (fromDb) {
          setAutoDetectionDetails(fromDb)
          setGeneratingDetails(false)
          return
        }
      }
    } catch (err) {
      // If loading fails, fall back to generation below
    }

    await generateAutoDetectionDetails(issue)
  }

  // Build a compact context from a list of issues for Gemini
  const buildIssuesContext = (issues: ComplianceIssue[]): string => {
    const head = `Analyze the following compliance issues and generate an AI Insights dashboard summary. Provide structured JSON only.`
    const mapped = issues.map((i) => {
      const created = i.date_created ? formatDate(i.date_created) : "unknown"
      return `- id: ${i.issue_id}; type: ${i.issue_type || "unknown"}; entity: ${i.entity || "unknown"}; severity: ${i.severity || "unknown"}; status: ${i.status || "unknown"}; assignee: ${i.assignee || "Unassigned"}; created: ${created}; desc: ${(i.description || "").slice(0, 240)}`
    }).join("\n")
    const tail = `Focus on duplicates, mismatches, threshold violations, and policy issues. Be specific and non-generic.`
    return `${head}\n\n${mapped}\n\n${tail}`
  }

  type AIInsightsResponse = {
    executiveSummary: string
    highPriorityRecommendations: string[]
    mediumPriorityActions: string[]
    strategicOpportunities: string[]
    impact: {
      resolutionTimeReductionPercent: number
      complianceScoreImprovementPercent: number
      synergyScoreDeltaPercent: number
      riskMitigationDeltaPercent: number
    }
  }

  const parseJsonLoose = (text: string): AIInsightsResponse | null => {
    try {
      // Strip markdown code fences if present
      const cleaned = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim()
      return JSON.parse(cleaned)
    } catch {
      return null
    }
  }

  const generateAIInsights = async () => {
    setAiLoading(true)
    setAiError(null)
    try {
      // Pull a representative sample of recent issues (up to 100) with role-based filtering
      let aiQuery = supabase
        .from("compliance_issues")
        .select("*")
        .order("date_created", { ascending: false })
        .limit(100)

      // Apply role-based filtering for AI insights
      if (currentUserRole !== 'dataTeamLead' && currentUserRole !== 'teamLead' && currentUser?.uid) {
        aiQuery = aiQuery.eq('assignee', currentUser.uid)
      }

      const { data: allIssues, error: issuesError } = await aiQuery

      if (issuesError) {
        throw new Error(issuesError.message)
      }

      const issues: ComplianceIssue[] = (allIssues || []) as ComplianceIssue[]
      if (issues.length === 0) {
        setAiExecutiveSummary("No compliance issues available to analyze.")
        setAiHighPriority([])
        setAiMediumPriority([])
        setAiStrategicOpportunities([])
        setAiImpact(null)
        setAiGeneratedAt(new Date().toLocaleString())
        return
      }

      const model = getGeminiModel()
      const context = buildIssuesContext(issues)

      if (model) {
        const prompt = `You are an expert compliance analyst. Output ONLY valid minified JSON (no prose) with this exact shape:
{
  "executiveSummary": string,
  "highPriorityRecommendations": string[3],
  "mediumPriorityActions": string[3],
  "strategicOpportunities": string[3],
  "impact": {
    "resolutionTimeReductionPercent": number, 
    "complianceScoreImprovementPercent": number, 
    "synergyScoreDeltaPercent": number, 
    "riskMitigationDeltaPercent": number
  }
}

Guidelines:
- Make items specific to the issues and entities provided.
- Avoid duplication across lists.
- Use percentage numbers without the % sign.

Data to analyze:
${context}`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        const parsed = parseJsonLoose(text)
        if (!parsed) throw new Error("Failed to parse AI Insights JSON.")

        setAiExecutiveSummary(parsed.executiveSummary)
        setAiHighPriority(parsed.highPriorityRecommendations || [])
        setAiMediumPriority(parsed.mediumPriorityActions || [])
        setAiStrategicOpportunities(parsed.strategicOpportunities || [])
        setAiImpact(parsed.impact || null)
        setAiGeneratedAt(new Date().toLocaleString())

        // Store AI insights in Supabase
        await storeAIInsightsInSupabase(parsed.executiveSummary, parsed.highPriorityRecommendations || [], parsed.mediumPriorityActions || [], parsed.strategicOpportunities || [], parsed.impact, issues.length)
      } else {
        // Fallback: use local summarizer + recommendation helper
        const context = buildIssuesContext(issues)
        const exec = await summarizeText(context, 150)
        const high = await geminiGenerateRecommendations(`${context}\n\nFocus: immediate, high-priority actions specific to issues.`, 3)
        const med = await geminiGenerateRecommendations(`${context}\n\nFocus: medium priority, process improvements and governance.`, 3)
        const strat = await geminiGenerateRecommendations(`${context}\n\nFocus: strategic opportunities and collaboration synergies.`, 3)

        setAiExecutiveSummary(exec || "AI summary unavailable.")
        setAiHighPriority((high || []).map(rec => cleanRecommendationText(rec)))
        setAiMediumPriority((med || []).map(rec => cleanRecommendationText(rec)))
        setAiStrategicOpportunities((strat || []).map(rec => cleanRecommendationText(rec)))
        setAiImpact({
          resolutionTimeReductionPercent: 20,
          complianceScoreImprovementPercent: 10,
          synergyScoreDeltaPercent: 8,
          riskMitigationDeltaPercent: 12,
        })
        setAiGeneratedAt(new Date().toLocaleString())

        // Store AI insights in Supabase
        await storeAIInsightsInSupabase(exec || "AI summary unavailable.", 
          (high || []).map(rec => cleanRecommendationText(rec)), 
          (med || []).map(rec => cleanRecommendationText(rec)), 
          (strat || []).map(rec => cleanRecommendationText(rec)), 
          {
            resolutionTimeReductionPercent: 20,
            complianceScoreImprovementPercent: 10,
            synergyScoreDeltaPercent: 8,
            riskMitigationDeltaPercent: 12,
          }, issues.length)
      }
    } catch (e: any) {
      setAiError(e?.message || "Failed to generate AI insights.")
    } finally {
      setAiLoading(false)
    }
  }

  // Load existing AI insights on first render
  useEffect(() => {
    loadExistingAIInsights()
  }, [currentUser?.uid])

  // Function to load existing AI insights from Supabase
  const loadExistingAIInsights = async () => {
    if (!currentUser?.uid) return
    
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('firebase_uid', currentUser.uid)
        .eq('dashboard_type', 'operational')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error loading AI insights:', error)
        return
      }
      
      if (data) {
        setAiInsightsId(data.id)
        setAiExecutiveSummary(data.executive_summary || '')
        setAiHighPriority(data.high_priority_recommendations || [])
        setAiMediumPriority(data.medium_priority_actions || [])
        setAiStrategicOpportunities(data.strategic_opportunities || [])
        setAiImpact(data.impact_data as any || null)
        setAiGeneratedAt(new Date(data.created_at).toLocaleString())
      }
    } catch (error) {
      console.error('Error loading AI insights:', error)
    }
  }

  // Helper function to create audit trail entries
  const createAuditEntry = async (action: string, metadata: any = {}) => {
    try {
      const { error } = await supabase
        .from('audit_events')
        .insert({
          action,
          firebase_uid: currentUser?.uid,
          metadata: {
            ...metadata,
            user_email: currentUser?.email,
            user_name: currentUser?.displayName || currentUser?.email,
            timestamp: new Date().toISOString()
          }
        })
      
      if (error) {
        console.error('Error creating audit entry:', error)
      }
    } catch (error) {
      console.error('Error creating audit entry:', error)
    }
  }

  // Function to store AI insights in Supabase
  const storeAIInsightsInSupabase = async (
    executiveSummary: string,
    highPriority: string[],
    mediumPriority: string[],
    strategicOpportunities: string[],
    impact: any,
    insightsCount: number
  ) => {
    if (!currentUser?.uid) return

    try {
      const insightsData = {
        firebase_uid: currentUser.uid,
        dashboard_type: 'operational',
        executive_summary: executiveSummary,
        high_priority_recommendations: highPriority,
        medium_priority_actions: mediumPriority,
        strategic_opportunities: strategicOpportunities,
        impact_data: impact,
        insights_count: insightsCount,
        generation_type: 'manual'
      }

      if (aiInsightsId) {
        // Update existing insights
        const { data: updateData, error: updateError } = await supabase
          .from('ai_insights')
          .update(insightsData)
          .eq('id', aiInsightsId)
          .select()
          .single()
        
        if (updateError) {
          console.error('Error updating AI insights:', updateError)
        } else if (updateData) {
          setAiInsightsId(updateData.id)
        }
      } else {
        // Create new insights
        const { data: insertData, error: insertError } = await supabase
          .from('ai_insights')
          .insert(insightsData)
          .select()
          .single()
        
        if (insertError) {
          console.error('Error creating AI insights:', insertError)
        } else if (insertData) {
          setAiInsightsId(insertData.id)
        }
      }

      // Create audit trail entry for AI insights generation
      await createAuditEntry('ai_insights_generated', {
        insights_count: insightsCount,
        executive_summary_length: executiveSummary.length,
        high_priority_count: highPriority.length,
        medium_priority_count: mediumPriority.length,
        strategic_opportunities_count: strategicOpportunities.length,
        generation_type: 'manual'
      })
    } catch (error) {
      console.error('Error storing AI insights:', error)
    }
  }

  const handleViewAutoDetectionDetails = async (issue: ComplianceIssue) => {
    setSelectedIssue(issue)
    setAutoDetectionDetails(null)
    setIsDialogOpen(true)
    await loadOrGenerateInsights(issue)
    
    // Create audit trail entry for viewing issue details
    await createAuditEntry('issue_comment_added', {
      issue_id: issue.issue_id,
      issue_type: issue.issue_type,
      entity: issue.entity,
      comment_by: currentUser?.displayName || currentUser?.email || 'Unknown User',
      comment_text: `Viewed auto-detection details and insights for ${issue.issue_type} issue`,
      severity: issue.severity,
      description: `${currentUser?.displayName || currentUser?.email} viewed detailed analysis for ${issue.issue_id}`
    })
    
    // Update user's last_login_at timestamp when viewing details
    if (currentUser?.uid) {
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          last_login_at: new Date().toISOString()
        })
        .eq('firebase_uid', currentUser.uid)
      
      if (userError) {
        console.error('Error updating user activity:', userError)
      }
    }
  }

  const handleResolveIssue = async (issue: ComplianceIssue) => {
    setResolutionIssue(issue)
    setResolutionStep('analysis')
    setResolutionActions([])
    setSelectedAction('')
    setResolutionNotes('')
    setResolutionStatus('pending')
    setIsResolutionDialogOpen(true)
    
    // Create audit trail entry for starting issue resolution
    await createAuditEntry('issue_status_updated', {
      issue_id: issue.issue_id,
      issue_type: issue.issue_type,
      entity: issue.entity,
      old_status: issue.status || 'Open',
      new_status: 'In Progress',
      updated_by: currentUser?.displayName || currentUser?.email || 'Unknown User',
      severity: issue.severity,
      description: `${currentUser?.displayName || currentUser?.email} started resolution process for ${issue.issue_id}`
    })
    
    // Update user's last_login_at timestamp when starting resolution
    if (currentUser?.uid) {
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          last_login_at: new Date().toISOString()
        })
        .eq('firebase_uid', currentUser.uid)
      
      if (userError) {
        console.error('Error updating user activity:', userError)
      }
    }
  }

  const handleDismissIssue = async (issue: ComplianceIssue) => {
    try {
      // Update issue status to dismissed
      const { error } = await supabase
        .from('compliance_issues')
        .update({ 
          status: 'Closed',
          date_resolved: new Date().toISOString(),
          resolution_notes: 'Issue dismissed by user'
        })
        .eq('issue_id', issue.issue_id)

      if (error) {
        console.error('Error dismissing issue:', error)
        return
      }

      // Create audit trail entry for dismissing issue
      await createAuditEntry('issue_resolved', {
        issue_id: issue.issue_id,
        issue_type: issue.issue_type,
        entity: issue.entity,
        resolved_by: currentUser?.displayName || currentUser?.email || 'Unknown User',
        resolution_notes: 'Issue dismissed as not requiring action',
        severity: issue.severity,
        description: `${currentUser?.displayName || currentUser?.email} dismissed ${issue.issue_id} as not requiring action`
      })

      // Refresh the issues list
      const from = (currentPage - 1) * rowsPerPage
      const to = from + rowsPerPage - 1
      
      let refreshQuery = supabase
        .from("compliance_issues")
        .select("*")
        .order("issue_id", { ascending: true })

      if (currentUserRole !== 'dataTeamLead' && currentUserRole !== 'teamLead' && currentUser?.uid) {
        refreshQuery = refreshQuery.eq('assignee', currentUser.uid)
      }
      
      const { data, error: refreshError } = await refreshQuery.range(from, to)
      
      if (refreshError) {
        console.error('Error refreshing issues:', refreshError)
      } else if (data) {
        setComplianceIssues(data)
      }
    } catch (error) {
      console.error('Error dismissing issue:', error)
    }
  }

  const generateResolutionActions = async (issue: ComplianceIssue) => {
    setResolutionLoading(true)
    try {
      const issueType = issue.issue_type?.toLowerCase() || ''
      const entity = issue.entity || 'the affected entity'
      
      let actions: string[] = []
      
      if (issueType.includes('duplicate')) {
        actions = [
          'Run automated deduplication with "keep most recent" strategy',
          'Merge duplicate records manually with data validation',
          'Update customer identification processes to prevent future duplicates',
          'Implement real-time duplicate detection alerts',
          'Reconcile customer IDs between systems'
        ]
      } else if (issueType.includes('mismatch')) {
        actions = [
          'Update data definitions to align with regulatory requirements',
          'Standardize field mappings across all systems',
          'Implement data validation rules for affected fields',
          'Create data governance documentation for the entity',
          'Establish cross-departmental data definition committee'
        ]
      } else if (issueType.includes('threshold')) {
        actions = [
          'Review and recalibrate threshold parameters',
          'Implement dynamic threshold adjustment system',
          'Set up automated threshold monitoring and alerting',
          'Establish threshold review and approval workflow',
          'Create threshold performance dashboard'
        ]
      } else if (issueType.includes('policy')) {
        actions = [
          'Conduct policy compliance audit and gap analysis',
          'Update operational procedures to align with policies',
          'Implement policy compliance monitoring system',
          'Establish policy training program for stakeholders',
          'Create policy exception handling process'
        ]
      } else {
        actions = [
          'Investigate root cause and document findings',
          'Implement preventive controls to avoid recurrence',
          'Establish monitoring and alerting for early detection',
          'Create standardized resolution procedures',
          'Update data quality controls'
        ]
      }
      
      setResolutionActions(actions)
      setResolutionStep('action')
    } catch (error) {
      console.error('Error generating resolution actions:', error)
    } finally {
      setResolutionLoading(false)
    }
  }

  const executeResolutionAction = async () => {
    if (!resolutionIssue || !selectedAction) {
      console.log('Missing required data:', { resolutionIssue: !!resolutionIssue, selectedAction })
      return
    }
    
    setResolutionLoading(true)
    try {
      console.log('Starting resolution execution for issue:', resolutionIssue.issue_id)
      
      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update issue status in Supabase
      const updateData = {
        status: 'Closed' as const,
        assignee: currentUser?.uid || 'Current User' // Use actual current user UID
      }
      
      console.log('Updating issue with data:', updateData)
      
      const { data: updateResult, error } = await supabase
        .from('compliance_issues')
        .update(updateData)
        .eq('issue_id', resolutionIssue.issue_id)
        .select() // Add this to get the updated record

      // Update user's last_login_at timestamp
      if (currentUser?.uid) {
        const { error: userError } = await supabase
          .from('users')
          .update({ 
            last_login_at: new Date().toISOString()
          })
          .eq('firebase_uid', currentUser.uid)
        
        if (userError) {
          console.error('Error updating user activity:', userError)
        }
      }
      
      if (error) {
        console.error('Supabase update error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        })
        throw error
      }
      
      console.log('Successfully updated issue:', updateResult)
      
      // Create audit trail entry for issue resolution
      await createAuditEntry('issue_resolved', {
        issue_id: resolutionIssue.issue_id,
        issue_type: resolutionIssue.issue_type,
        entity: resolutionIssue.entity,
        resolved_by: currentUser?.displayName || currentUser?.email || 'Unknown User',
        resolution_notes: resolutionNotes,
        severity: resolutionIssue.severity,
        description: `Issue resolved by ${currentUser?.displayName || currentUser?.email} with action: ${selectedAction}`
      })
      
      setResolutionStatus('Closed')
      setResolutionStep('complete')
      setResolutionSuccess(true)
      
      // Refresh the issues list with proper role-based filtering
      const from = (currentPage - 1) * rowsPerPage
      const to = from + rowsPerPage - 1
      
      // Build query with same filtering logic as main data fetch
      let refreshQuery = supabase
        .from("compliance_issues")
        .select("*")
        .order("issue_id", { ascending: true })

      // Apply role-based filtering
      if (currentUserRole !== 'dataTeamLead' && currentUserRole !== 'teamLead' && currentUser?.uid) {
        refreshQuery = refreshQuery.eq('assignee', currentUser.uid)
      }
      
      const { data, error: refreshError } = await refreshQuery.range(from, to)
      
      if (refreshError) {
        console.error('Error refreshing issues:', refreshError)
      } else if (data) {
        console.log('Successfully refreshed issues list, new count:', data.length)
        setComplianceIssues(data)
        
        // If current page is empty and not the first page, go to previous page
        if (data.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1)
        }
      }
      
      // Also refresh the total count
      let countQuery = supabase
        .from("compliance_issues")
        .select("*", { count: "exact", head: true })

      if (currentUserRole !== 'dataTeamLead' && currentUserRole !== 'teamLead' && currentUser?.uid) {
        countQuery = countQuery.eq('assignee', currentUser.uid)
      }

      const { count, error: countError } = await countQuery
      
      if (countError) {
        console.error("Error refreshing count:", countError.message)
      } else {
        setTotalCount(count || 0)
      }

      // Refresh team members data to update activity
      const { data: refreshedTeamMembers, error: teamMembersRefreshError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'dataTeam')
        .order('last_login_at', { ascending: false })
      
      if (teamMembersRefreshError) {
        console.error('Error refreshing team members:', teamMembersRefreshError)
      } else {
        // Transform users data to match team_members structure
        const transformedTeamMembers = (refreshedTeamMembers || []).map(user => ({
          id: user.firebase_uid,
          firebase_uid: user.firebase_uid,
          name: user.name || user.email || 'Unknown User',
          email: user.email || '',
          role: 'data_analyst' as const,
          status: 'active' as const,
          last_active: user.last_login_at,
          assigned_issues: 0, // Will be calculated from compliance issues
          performance: 85, // Default performance score
          created_at: user.created_at,
          updated_at: user.last_login_at || user.created_at
        }))
        setTeamMembers(transformedTeamMembers)
      }
      
    } catch (error: any) {
      console.error('Error executing resolution action:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        fullError: error
      })
      setResolutionStatus('failed')
    } finally {
      setResolutionLoading(false)
    }
  }

  const closeResolutionDialog = () => {
    setIsResolutionDialogOpen(false)
    setResolutionIssue(null)
    setResolutionStep('analysis')
    setResolutionActions([])
    setSelectedAction('')
    setResolutionNotes('')
    setResolutionStatus('pending')
    setResolutionSuccess(false)
  }

  // Helper functions for workflow display
  const getWorkflowStep = (issue: ComplianceIssue): { step: string; progress: number } => {
    const status = issue.status || 'Open'
    
    switch (status) {
      case 'Open':
        return { step: 'Step 1 of 3: Issue Analysis', progress: 33 }
      case 'In Progress':
        return { step: 'Step 2 of 3: Action Execution', progress: 66 }
      case 'Closed':
        return { step: 'Completed: Issue resolved', progress: 100 }
      default:
        return { step: 'Step 1 of 3: Issue Analysis', progress: 33 }
    }
  }

  const getWorkflowStatusColor = (status: string): string => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-500'
      case 'Open':
        return 'bg-yellow-500'
      case 'Closed':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getWorkflowStatusBadge = (status: string): { className: string; text: string } => {
    switch (status) {
      case 'In Progress':
        return { className: 'bg-blue-100 text-blue-800', text: 'In Progress' }
      case 'Open':
        return { className: 'bg-yellow-100 text-yellow-800', text: 'Open' }
      case 'Closed':
        return { className: 'bg-green-100 text-green-800', text: 'Closed' }
      default:
        return { className: 'bg-gray-100 text-gray-800', text: 'Unknown' }
    }
  }

  const handleWorkflowAction = (issue: ComplianceIssue, action: 'view' | 'resolve' | 'review') => {
    switch (action) {
      case 'view':
        handleViewAutoDetectionDetails(issue)
        break
      case 'resolve':
        handleResolveIssue(issue)
        break
      case 'review':
        // Could open a review dialog
        console.log(`Review issue ${issue.issue_id}`)
        break
    }
  }

  // Get active workflows from current compliance issues
  const activeWorkflows = complianceIssues.filter(issue => 
    issue.status && ['Open', 'In Progress'].includes(issue.status)
  )

  // Get resolved workflows
  const resolvedWorkflows = complianceIssues.filter(issue => 
    issue.status === 'Closed'
  ).slice(0, 2) // Show only 2 most recent resolved

  // Calculate workflow statistics
  const workflowStats = {
    active: activeWorkflows.length,
    pending: complianceIssues.filter(i => i.status === 'Open').length,
    inProgress: complianceIssues.filter(i => i.status === 'In Progress').length,
    resolved: complianceIssues.filter(i => i.status === 'Closed').length,
    total: complianceIssues.length
  }

  // Helper function to get steward activity data
  const getStewardActivity = (teamMember: any) => {
    const memberIssues = complianceIssues.filter(issue => 
      issue.assignee === teamMember.firebase_uid
    )
    
    const resolvedThisWeek = memberIssues.filter(issue => 
      issue.status === 'Closed' && 
      issue.date_created && 
      new Date(issue.date_created) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
    
    const pendingReviews = memberIssues.filter(issue => 
      issue.status === 'Open'
    ).length
    
    const inProgress = memberIssues.filter(issue => 
      issue.status === 'In Progress'
    ).length
    
    return {
      resolvedThisWeek,
      pendingReviews,
      inProgress,
      totalAssigned: memberIssues.length,
      performance: teamMember.performance || 85
    }
  }

  // Helper function to get activity status
  const getActivityStatus = (teamMember: any) => {
    if (!teamMember.last_active) return 'Inactive'
    
    const lastActive = new Date(teamMember.last_active)
    const now = new Date()
    const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceActive < 1) return 'Active'
    if (hoursSinceActive < 24) return 'Recent'
    if (hoursSinceActive < 168) return 'This Week'
    return 'Inactive'
  }

  // Helper function to get status badge styling
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Recent':
        return 'bg-blue-100 text-blue-800'
      case 'This Week':
        return 'bg-yellow-100 text-yellow-800'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Helper function to get avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-purple-100 text-purple-600',
      'bg-blue-100 text-blue-600', 
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-600',
      'bg-red-100 text-red-600',
      'bg-indigo-100 text-indigo-600'
    ]
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="issue-tracking">Issue Tracking</TabsTrigger>
            <TabsTrigger value="resolution-workflows">Resolution Workflows</TabsTrigger>
            <TabsTrigger value="root-cause-analysis">Root Cause Analysis</TabsTrigger>
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
                    <CardDescription>
                      {currentUserRole === 'dataTeamLead' || currentUserRole === 'teamLead' 
                        ? 'Track and manage all flagged compliance issues across the team'
                        : 'View and manage issues assigned to you'
                      }
                    </CardDescription>
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
                    searchValue={searchTerm}
                    filterValue={selectedFilter}
                    onSearchChange={setSearchTerm}
                    onFilterChange={setSelectedFilter}
                    additionalFilters={[
                      {
                        key: "entity",
                        label: "Entity",
                        options: getUniqueEntities().map(entity => ({ value: entity, label: entity })),
                        value: selectedEntity,
                        onValueChange: setSelectedEntity
                      },
                      {
                        key: "issueType",
                        label: "Issue Type",
                        options: getUniqueIssueTypes().map(issueType => ({ value: issueType, label: issueType })),
                        value: selectedIssueType,
                        onValueChange: setSelectedIssueType
                      }
                    ]}
                    onClearAllFilters={() => {
                      setSearchTerm("")
                      setSelectedFilter("all")
                      setSelectedEntity("all")
                      setSelectedIssueType("all")
                    }}
                    showClearButton={true}
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
                    {/* Filter Results Count */}
                    {(searchTerm || selectedFilter !== "all" || selectedEntity !== "all" || selectedIssueType !== "all") && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Showing {filteredStartItem}-{filteredEndItem} of {filteredIssues.length} filtered issues
                          {searchTerm && ` matching "${searchTerm}"`}
                          {selectedFilter !== "all" && ` with ${selectedFilter} filter`}
                          {selectedEntity !== "all" && ` for ${selectedEntity}`}
                          {selectedIssueType !== "all" && ` of type ${selectedIssueType}`}
                          {filteredIssues.length !== complianceIssues.length && ` (from ${complianceIssues.length} total)`}
                        </p>
                      </div>
                    )}
                    
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
                        {getFilteredIssues().length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                              {complianceIssues.length === 0 
                                ? "No compliance issues found" 
                                : "No issues match the current filters"
                              }
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedFilteredIssues.map((issue, index) => (
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
                              <TableCell>{getAssigneeName(issue.assignee)}</TableCell>
                              <TableCell>
                                {formatDate(issue.date_created)}
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
                                      label: "Resolve Issue",
                                      icon: FileText,
                                      onClick: () => handleResolveIssue(issue)
                                    },
                                    {
                                      label: "Dismiss Issue",
                                      icon: X,
                                      onClick: () => handleDismissIssue(issue),
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

                    <Pagination
                      currentPage={currentPage}
                      totalPages={filteredTotalPages}
                      totalCount={filteredIssues.length}
                      startItem={filteredStartItem}
                      endItem={filteredEndItem}
                      onPageChange={handlePageChange}
                      getPageNumbers={getPageNumbers}
                    />
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Active Workflows</CardTitle>
                      <CardDescription>
                        Current resolution processes in progress ({activeWorkflows.length} active)
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Refresh the main issues data and team members
                        const fetchData = async () => {
                          setLoading(true)
                          try {
                            const from = (currentPage - 1) * rowsPerPage
                            const to = from + rowsPerPage - 1
                            
                            // Build query with same filtering logic as main data fetch
                            let refreshQuery = supabase
                              .from("compliance_issues")
                              .select("*")
                              .order("issue_id", { ascending: true })

                            // Apply role-based filtering
                            if (currentUserRole !== 'dataTeamLead' && currentUserRole !== 'teamLead' && currentUser?.uid) {
                              refreshQuery = refreshQuery.eq('assignee', currentUser.uid)
                            }
                            
                            const { data, error } = await refreshQuery.range(from, to)
                            
                            if (!error && data) {
                              setComplianceIssues(data)
                            }

                            // Also refresh team members data
                            const { data: refreshedTeamMembers, error: teamMembersError } = await supabase
                              .from('users')
                              .select('*')
                              .eq('role', 'dataTeam')
                              .order('last_login_at', { ascending: false })
                            
                            if (!teamMembersError && refreshedTeamMembers) {
                              const transformedTeamMembers = refreshedTeamMembers.map(user => ({
                                id: user.firebase_uid,
                                firebase_uid: user.firebase_uid,
                                name: user.name || user.email || 'Unknown User',
                                email: user.email || '',
                                role: 'data_analyst' as const,
                                status: 'active' as const,
                                last_active: user.last_login_at,
                                assigned_issues: 0,
                                performance: 85,
                                created_at: user.created_at,
                                updated_at: user.last_login_at || user.created_at
                              }))
                              setTeamMembers(transformedTeamMembers)
                            }
                          } catch (error) {
                            console.error("Error refreshing data:", error)
                          } finally {
                            setLoading(false)
                          }
                        }
                        fetchData()
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Refreshing...' : '🔄 Refresh'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-500">Loading workflows...</span>
                      </div>
                    </div>
                  ) : activeWorkflows.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No active workflows found</p>
                      <p className="text-xs mt-1">All issues are either resolved or not yet started</p>
                    </div>
                  ) : (
                    activeWorkflows.map((issue) => {
                      const { step, progress } = getWorkflowStep(issue)
                              const statusColor = getWorkflowStatusColor(issue.status || 'Open')
        const statusBadge = getWorkflowStatusBadge(issue.status || 'Open')
                      
                      return (
                        <div key={issue.issue_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-3 h-3 ${statusColor} rounded-full`}></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-sm">
                                  {issue.issue_id}: {issue.issue_type}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge className={statusBadge.className}>
                                    {statusBadge.text}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleWorkflowAction(issue, 'view')}
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleWorkflowAction(issue, 'resolve')}
                                    >
                                      <FileText className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                {step} • {issue.entity} • {getAssigneeName(issue.assignee)}
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}

                  {/* Show recent resolved workflows */}
                  {resolvedWorkflows.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Recently Resolved</h4>
                      {resolvedWorkflows.map((issue) => {
                        const { step, progress } = getWorkflowStep(issue)
                        const statusColor = getWorkflowStatusColor(issue.status || 'Closed')
                        const statusBadge = getWorkflowStatusBadge(issue.status || 'Closed')
                        
                        return (
                          <div key={issue.issue_id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50/50">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-3 h-3 ${statusColor} rounded-full`}></div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-medium text-sm">
                                    {issue.issue_id}: {issue.issue_type}
                                  </p>
                                  <Badge className={statusBadge.className}>
                                    {statusBadge.text}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {step} • {issue.entity} • {getAssigneeName(issue.assignee)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Steward Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Steward Activity</CardTitle>
                  <CardDescription>
                    Real-time data steward engagement and activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-500">Loading steward activity...</span>
                      </div>
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No active team members found</p>
                      <p className="text-xs mt-1">Team members will appear here when they are added to the system</p>
                    </div>
                  ) : (
                    teamMembers.slice(0, 5).map((member) => {
                      const activity = getStewardActivity(member)
                      const status = getActivityStatus(member)
                      const initials = getInitials(member.name)
                      const avatarColor = getAvatarColor(member.name)
                      
                      return (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 ${avatarColor} rounded-full flex items-center justify-center font-bold text-xs`}>
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{member.name}</p>
                              <p className="text-xs text-gray-600">
                                {activity.resolvedThisWeek > 0 
                                  ? `Resolved ${activity.resolvedThisWeek} issues this week`
                                  : activity.pendingReviews > 0
                                    ? `${activity.pendingReviews} pending reviews`
                                    : activity.inProgress > 0
                                      ? `${activity.inProgress} in progress`
                                      : `${activity.totalAssigned} assigned issues`
                                }
                              </p>
                              <p className="text-xs text-gray-500">
                                Performance: {activity.performance}% • Role: {member.role.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={getStatusBadgeStyle(status)}>
                              {status}
                            </Badge>
                            {member.last_active && (
                              <p className="text-xs text-gray-500">
                                {new Date(member.last_active).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                  
                  {teamMembers.length > 5 && (
                    <div className="text-center pt-2">
                      <p className="text-xs text-gray-500">
                        +{teamMembers.length - 5} more team members
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Workflow Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                      <p className="text-2xl font-bold">{workflowStats.active}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Review</p>
                      <p className="text-2xl font-bold">{workflowStats.pending}</p>
                    </div>
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Resolved</p>
                      <p className="text-2xl font-bold">{workflowStats.resolved}</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold">
                        {workflowStats.total > 0 ? Math.round((workflowStats.resolved / workflowStats.total) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>




          {/* Root Cause Analysis Tab */}
          <TabsContent value="root-cause-analysis" className="space-y-6">
            {/* Real Compliance Charts */}
            <ComplianceCharts />

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


          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Generated Compliance Report */}
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Generated Compliance Report</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={generateAIInsights} disabled={aiLoading}>
                        {aiLoading ? 'Generating…' : '🔄 Regenerate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs bg-transparent"
                        onClick={() => {
                          const payload = {
                            generatedAt: aiGeneratedAt || new Date().toISOString(),
                            executiveSummary: aiExecutiveSummary,
                            highPriorityRecommendations: aiHighPriority,
                            mediumPriorityActions: aiMediumPriority,
                            strategicOpportunities: aiStrategicOpportunities,
                            impact: aiImpact,
                          }
                          const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `ai-insights-${Date.now()}.json`
                          a.click()
                          URL.revokeObjectURL(url)
                        }}
                        disabled={aiLoading}
                      >
                        📤 Export
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    {aiError ? (
                      <span className="text-red-600">{aiError}</span>
                    ) : (
                      'AI analysis of current compliance landscape and recommendations'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-sm">
                  {aiLoading ? (
                    <div className="flex items-center justify-center py-10 text-gray-500">Generating AI insights…</div>
                  ) : (
                    <>
                      {/* Executive Summary */}
                      <div>
                        <h4 className="font-semibold text-purple-600 mb-2 text-base">Executive Summary</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {aiExecutiveSummary || 'No summary available.'}
                        </p>
                      </div>

                      {/* High Priority Recommendations */}
                      <div className="border-l-4 border-red-500 pl-4 bg-red-50/50 py-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-600 mb-2 text-base">High Priority Recommendations</h4>
                        <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                          {(aiHighPriority.length ? aiHighPriority : []).map((item, idx) => (
                            <li key={idx}>{cleanRecommendationText(item)}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Medium Priority Actions */}
                      <div className="border-l-4 border-yellow-500 pl-4 bg-yellow-50/50 py-3 rounded-r-lg">
                        <h4 className="font-semibold text-yellow-600 mb-2 text-base">Medium Priority Actions</h4>
                        <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                          {(aiMediumPriority.length ? aiMediumPriority : []).map((item, idx) => (
                            <li key={idx}>{cleanRecommendationText(item)}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Strategic Opportunities */}
                      <div className="border-l-4 border-green-500 pl-4 bg-green-50/50 py-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-600 mb-2 text-base">Strategic Opportunities</h4>
                        <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                          {(aiStrategicOpportunities.length ? aiStrategicOpportunities : []).map((item, idx) => (
                            <li key={idx}>{cleanRecommendationText(item)}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Predicted Impact */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3 text-base">Predicted Impact</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-xs text-blue-600 font-medium mb-1">Resolution Time Reduction:</p>
                            <p className="font-bold text-lg text-blue-700">{aiImpact ? `${aiImpact.resolutionTimeReductionPercent}%` : '—'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-blue-600 font-medium mb-1">Compliance Score Improvement:</p>
                            <p className="font-bold text-lg text-blue-700">{aiImpact ? `${aiImpact.complianceScoreImprovementPercent}%` : '—'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-blue-600 font-medium mb-1">Cross-Entity Synergy Score:</p>
                            <p className="font-bold text-lg text-blue-700">{aiImpact ? `${aiImpact.synergyScoreDeltaPercent}%` : '—'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-blue-600 font-medium mb-1">Risk Mitigation:</p>
                            <p className="font-bold text-lg text-blue-700">{aiImpact ? `${aiImpact.riskMitigationDeltaPercent}%` : '—'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Report Footer */}
                      <p className="text-xs text-gray-500 pt-2 border-t">
                        Report generated on {aiGeneratedAt || new Date().toLocaleString()}
                      </p>
                    </>
                  )}
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
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">"What are the most common compliance issues this month?"</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">Based on the data, duplicate records and data definition mismatches are the most frequent issues, affecting 60% of flagged cases.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Ask a question..."
                      className="w-full p-2 border rounded-lg text-sm"
                    />
                    <Button size="sm" className="w-full">Send</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Glossary Tab */}
          <TabsContent value="data-glossary" className="space-y-6">
            <SimpleGlossaryTab />
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
              System-generated compliance issue detected on {formatDate(selectedIssue?.date_created) || 'Unknown date'}.
            </DialogDescription>
          </DialogHeader>

          {selectedIssue && (
            <div className="space-y-6">
              {/* Issue Overview */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-600">Issue Type</p>
                  <p>{selectedIssue?.issue_type}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Affected Entity</p>
                  <p>{selectedIssue?.entity}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Severity</p>
                  <StatusBadge status={selectedIssue?.severity || "unknown"} variant="severity" />
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
                      {selectedIssue?.issue_type?.toLowerCase().includes('duplicate') 
                        ? "Apply automated deduplication using 'keep most recent' strategy with transaction history preservation."
                        : autoDetectionDetails?.recommendations[0] || "Review and resolve the compliance issue according to standard procedures."
                      }
                    </p>
                  </div>

                  {/* Additional Recommendations */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Additional Recommendations</h3>
                    <ul className="space-y-2">
                      {autoDetectionDetails?.recommendations.slice(1).map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{cleanRecommendationText(recommendation)}</span>
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
                          variant={autoDetectionDetails?.riskLevel === 'high' ? 'destructive' : 
                                 autoDetectionDetails?.riskLevel === 'medium' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {autoDetectionDetails?.riskLevel?.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Confidence Score:</span>
                        <span className="ml-2 font-semibold">{autoDetectionDetails?.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Issue Resolution Dialog */}
      <Dialog open={isResolutionDialogOpen} onOpenChange={setIsResolutionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Resolve Issue: {resolutionIssue?.issue_id}
            </DialogTitle>
            <DialogDescription>
              Step-by-step resolution process for {resolutionIssue?.issue_type} issue affecting {resolutionIssue?.entity}.
            </DialogDescription>
          </DialogHeader>

          {resolutionIssue && (
            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between">
                {[
                  { key: 'analysis', label: 'Analysis', icon: '🔍' },
                  { key: 'action', label: 'Action', icon: '⚡' },
                  { key: 'verification', label: 'Verification', icon: '✅' },
                  { key: 'complete', label: 'Complete', icon: '🎉' }
                ].map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      resolutionStep === step.key 
                        ? 'bg-blue-500 text-white' 
                        : index < ['analysis', 'action', 'verification', 'complete'].indexOf(resolutionStep)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index < ['analysis', 'action', 'verification', 'complete'].indexOf(resolutionStep) ? '✓' : step.icon}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      resolutionStep === step.key ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    {index < 3 && (
                      <div className={`w-16 h-0.5 mx-2 ${
                        index < ['analysis', 'action', 'verification', 'complete'].indexOf(resolutionStep)
                          ? 'bg-green-500' 
                          : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              {resolutionStep === 'analysis' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-lg mb-3">Issue Analysis</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Issue Type:</span>
                        <span className="ml-2">{resolutionIssue.issue_type}</span>
                      </div>
                      <div>
                        <span className="font-medium">Affected Entity:</span>
                        <span className="ml-2">{resolutionIssue.entity}</span>
                      </div>
                      <div>
                        <span className="font-medium">Severity:</span>
                        <StatusBadge status={resolutionIssue.severity || "unknown"} variant="severity" />
                      </div>
                      <div>
                        <span className="font-medium">Current Status:</span>
                        <StatusBadge status={resolutionIssue.status || "unknown"} variant="status" />
                      </div>
                    </div>
                    {resolutionIssue.description && (
                      <div className="mt-4">
                        <span className="font-medium">Description:</span>
                        <p className="mt-1 text-gray-700">{resolutionIssue.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => resolutionIssue && generateResolutionActions(resolutionIssue)} disabled={resolutionLoading}>
                      {resolutionLoading ? 'Analyzing...' : 'Generate Resolution Actions'}
                    </Button>
                  </div>
                </div>
              )}

              {resolutionStep === 'action' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-lg mb-3">Select Resolution Action</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose the most appropriate action to resolve this {resolutionIssue?.issue_type} issue:
                    </p>
                    
                    <div className="space-y-2">
                      {resolutionActions.map((action, index) => (
                        <label key={index} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="resolutionAction"
                            value={action}
                            checked={selectedAction === action}
                            onChange={(e) => setSelectedAction(e.target.value)}
                            className="mt-1"
                          />
                          <span className="text-sm">{action}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700">Resolution Notes (Optional)</span>
                      <textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Add any additional notes about the resolution..."
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </label>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setResolutionStep('analysis')}>
                      ← Back to Analysis
                    </Button>
                    <Button 
                      onClick={executeResolutionAction} 
                      disabled={!selectedAction || resolutionLoading}
                    >
                      {resolutionLoading ? 'Executing...' : 'Execute Resolution'}
                    </Button>
                  </div>
                </div>
              )}

              {resolutionStep === 'verification' && (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-lg mb-3">Verification in Progress</h3>
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Verifying resolution...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {resolutionStep === 'complete' && (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-lg mb-3">Resolution Complete</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span>Issue {resolutionIssue?.issue_id} has been successfully resolved</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Action taken:</strong> {selectedAction}</p>
                        {resolutionNotes && <p><strong>Notes:</strong> {resolutionNotes}</p>}
                        <p><strong>Resolved by:</strong> {currentUser?.displayName || currentUser?.email || 'Current User'}</p>
                        <p><strong>Resolved on:</strong> {formatDate(new Date().toISOString())}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={closeResolutionDialog}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
