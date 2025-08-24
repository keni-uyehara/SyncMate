"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { KPICard } from "@/components/ui/kpi-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { ActionDropdown } from "@/components/ui/action-dropdown"
import { Pagination } from "@/components/ui/pagination"
import { supabase } from "@/supabaseClient"
import type { Database } from "@/types/database.types"

import {
  AlertTriangle,
  Eye,
  CheckCircle,
  Loader2,
  Users,
  UserPlus,
  TrendingUp,
  UserX
} from "lucide-react"

type TeamMember = {
  id: string
  name: string
  email: string | null
  role: Database['public']['Tables']['users']['Row']['role']
  status: string
  assigned_issues: number
  performance: number
  firebase_uid: string
  last_active: string | null
  permissions: string[]
}

// Role type removed - using users table instead

type ComplianceIssue = Database['public']['Tables']['compliance_issues']['Row']
type AuditEvent = Database['public']['Tables']['audit_events']['Row']

export default function DataTeamLeadDashboard() {
  const [complianceIssues, setComplianceIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [users, setUsers] = useState<Database['public']['Tables']['users']['Row'][]>([])
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
  const [auditLoading, setAuditLoading] = useState(true)
  const [auditCurrentPage, setAuditCurrentPage] = useState(1)
  const [auditTotalCount, setAuditTotalCount] = useState(0)
  const auditRowsPerPage = 5

  // Removed roles state - using users table instead

  const rowsPerPage = 5

  // Role Management State
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isAssignUserDialogOpen, setIsAssignUserDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [selectedUser, setSelectedUser] = useState<Database['public']['Tables']['users']['Row'] | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<ComplianceIssue | null>(null)
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "data_analyst" as TeamMember['role']
  })
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "dataTeam" as Database['public']['Tables']['users']['Row']['role']
  })

  // Available permissions
  const availablePermissions = [
    { id: "view_issues", name: "View Issues", description: "Can view compliance issues" },
    { id: "edit_issues", name: "Edit Issues", description: "Can edit issue details" },
    { id: "resolve_issues", name: "Resolve Issues", description: "Can mark issues as resolved" },
    { id: "generate_reports", name: "Generate Reports", description: "Can create and export reports" },
    { id: "manage_workflows", name: "Manage Workflows", description: "Can manage resolution workflows" },
    { id: "manage_roles", name: "Manage Roles", description: "Can create and edit roles" },
    { id: "manage_users", name: "Manage Users", description: "Can add and remove team members" }
  ]

  useEffect(() => {
    fetchData()
  }, [currentPage])

  useEffect(() => {
    fetchAuditEvents()
  }, [auditCurrentPage])

  // Pagination helper functions
  const totalPages = Math.ceil(totalCount / rowsPerPage)
  const startItem = totalCount > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0
  const endItem = Math.min(currentPage * rowsPerPage, totalCount)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Audit trail pagination helper functions
  const auditTotalPages = Math.ceil(auditTotalCount / auditRowsPerPage)
  const auditStartItem = auditTotalCount > 0 ? (auditCurrentPage - 1) * auditRowsPerPage + 1 : 0
  const auditEndItem = Math.min(auditCurrentPage * auditRowsPerPage, auditTotalCount)

  const handleAuditPageChange = (page: number) => {
    setAuditCurrentPage(page)
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
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

  const getAuditPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (auditTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= auditTotalPages; i++) {
        pages.push(i)
      }
    } else {
      if (auditCurrentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(auditTotalPages)
      } else if (auditCurrentPage >= auditTotalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = auditTotalPages - 3; i <= auditTotalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = auditCurrentPage - 1; i <= auditCurrentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(auditTotalPages)
      }
    }
    
    return pages
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch team members from users table instead
      const { data: teamUsersData, error: teamUsersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (teamUsersError) {
        console.error('Error fetching users:', teamUsersError)
      } else {
        // Convert users to team members format
        const membersWithPermissions = (teamUsersData || []).map(user => ({
          id: user.firebase_uid,
          name: user.name || 'Unknown User',
          email: user.email,
          role: user.role,
          status: 'active',
          assigned_issues: 0,
          performance: 85,
          firebase_uid: user.firebase_uid,
          last_active: user.last_login_at,
          permissions: getPermissionsForRole(user.role)
        }))
        setTeamMembers(membersWithPermissions)
      }

      // Roles functionality removed - using users table instead

      // Get total count for compliance issues
      const { count, error: countError } = await supabase
        .from('compliance_issues')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Error fetching compliance issues count:', countError)
        setTotalCount(0)
      } else {
        setTotalCount(count || 0)
      }

      // Fetch paginated compliance issues
      const from = (currentPage - 1) * rowsPerPage
      const to = from + rowsPerPage - 1
      
      const { data: issuesData, error: issuesError } = await supabase
        .from('compliance_issues')
        .select('*')
        .order('date_created', { ascending: false })
        .range(from, to)

      if (issuesError) {
        console.error('Error fetching compliance issues:', issuesError)
      } else {
        setComplianceIssues(issuesData || [])
      }

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) {
        console.error('Error fetching users:', usersError)
      } else {
        setUsers(usersData || [])
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditEvents = async () => {
    setAuditLoading(true)
    try {
      // Get total count first
      const { count, error: countError } = await supabase
        .from('audit_events')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Error fetching audit events count:', countError)
        setAuditTotalCount(0)
      } else {
        setAuditTotalCount(count || 0)
      }

      // Get paginated data
      const from = (auditCurrentPage - 1) * auditRowsPerPage
      const to = from + auditRowsPerPage - 1
      
      const { data: auditData, error: auditError } = await supabase
        .from('audit_events')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (auditError) {
        console.error('Error fetching audit events:', auditError)
      } else {
        setAuditEvents(auditData || [])
      }
    } catch (error) {
      console.error('Error fetching audit events:', error)
    } finally {
      setAuditLoading(false)
    }
  }

  // Helper function to create audit trail entries
  const createAuditEntry = async (action: string, metadata: any = {}) => {
    try {
      const { error } = await supabase
        .from('audit_events')
        .insert({
          action,
          firebase_uid: null, // Will be set when user auth is implemented
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString()
          }
        })
      
      if (error) {
        console.error('Error creating audit entry:', error)
      } else {
        // Refresh audit events after creating new entry
        await fetchAuditEvents()
      }
    } catch (error) {
      console.error('Error creating audit entry:', error)
    }
  }

  const getPermissionsForRole = (role: string): string[] => {
    switch (role) {
      case 'dataTeam':
        return ['view_issues', 'edit_issues']
      case 'teamLead':
        return ['view_issues', 'edit_issues', 'resolve_issues', 'generate_reports', 'manage_workflows']
      case 'dataTeamLead':
        return ['view_issues', 'edit_issues', 'resolve_issues', 'generate_reports', 'manage_workflows', 'manage_roles', 'manage_users']
      default:
        return ['view_issues']
    }
  }

  // Team member creation removed - using users table instead

  const handleUpdateMemberRole = async (memberId: string, newRole: TeamMember['role']) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) {
        console.error('Error updating member role:', error)
        return
      }

      setTeamMembers(members => 
        members.map(member => 
          member.id === memberId 
            ? { 
                ...member, 
                role: newRole, 
                permissions: getPermissionsForRole(newRole)
              }
            : member
        )
      )
    } catch (error) {
      console.error('Error updating member role:', error)
    }
  }

  const handleToggleMemberStatus = async (memberId: string) => {
    try {
      const member = teamMembers.find(m => m.id === memberId)
      if (!member) return

      const newStatus = member.status === 'active' ? 'inactive' : 'active'
      
      const { error } = await supabase
        .from('team_members')
        .update({ status: newStatus })
        .eq('id', memberId)

      if (error) {
        console.error('Error updating member status:', error)
        return
      }

      setTeamMembers(members =>
        members.map(member =>
          member.id === memberId
            ? { ...member, status: newStatus }
            : member
        )
      )
    } catch (error) {
      console.error('Error updating member status:', error)
    }
  }

  const getRoleDisplayName = (role: TeamMember['role']) => {
    switch (role) {
      case 'dataTeam': return 'Data Team'
      case 'teamLead': return 'Team Lead'
      case 'dataTeamLead': return 'Data Team Lead'
      default: return role
    }
  }

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper function to get compliance record activity data
  const getComplianceRecordActivity = (issue: ComplianceIssue) => {
    const now = new Date()
    const issueCreated = issue.date_created ? new Date(issue.date_created) : null
    const issueResolved = issue.date_resolved ? new Date(issue.date_resolved) : null
    
    let timeSinceCreated = null
    let timeSinceResolved = null
    let resolutionTime = null
    
    if (issueCreated) {
      timeSinceCreated = Math.floor((now.getTime() - issueCreated.getTime()) / (1000 * 60 * 60 * 24)) // days
    }
    
    if (issueResolved) {
      timeSinceResolved = Math.floor((now.getTime() - issueResolved.getTime()) / (1000 * 60 * 60 * 24)) // days
      if (issueCreated) {
        resolutionTime = Math.floor((issueResolved.getTime() - issueCreated.getTime()) / (1000 * 60 * 60 * 24)) // days
      }
    }
    
    const assignee = users.find(user => user.firebase_uid === issue.assignee)
    
    return {
      timeSinceCreated,
      timeSinceResolved,
      resolutionTime,
      assignee: assignee?.name || assignee?.email || 'Unassigned',
      isRecent: timeSinceCreated !== null && timeSinceCreated <= 7,
      isResolved: issue.status === 'Closed',
      isInProgress: issue.status === 'In Progress',
      isOpen: issue.status === 'Open',
      severity: issue.severity || 'Unknown',
      entity: issue.entity,
      issueType: issue.issue_type
    }
  }

  // Helper function to get compliance record status
  const getComplianceRecordStatus = (issue: ComplianceIssue) => {
    const activity = getComplianceRecordActivity(issue)
    
    if (activity.isResolved) {
      if (activity.resolutionTime && activity.resolutionTime <= 1) return 'Quickly Resolved'
      if (activity.resolutionTime && activity.resolutionTime <= 7) return 'Resolved This Week'
      return 'Resolved'
    }
    
    if (activity.isInProgress) {
      if (activity.timeSinceCreated && activity.timeSinceCreated <= 1) return 'Recently Started'
      if (activity.timeSinceCreated && activity.timeSinceCreated <= 7) return 'In Progress'
      return 'Long Running'
    }
    
    if (activity.isOpen) {
      if (activity.timeSinceCreated && activity.timeSinceCreated <= 1) return 'New Issue'
      if (activity.timeSinceCreated && activity.timeSinceCreated <= 7) return 'Recent Issue'
      return 'Stale Issue'
    }
    
    return 'Unknown'
  }

  // Performance ranking calculation functions
  const calculateMemberPerformance = (member: TeamMember) => {
    // Get issues assigned to this member
    const assignedIssues = complianceIssues.filter(issue => 
      issue.assignee && users.find(user => user.firebase_uid === issue.assignee)?.email === member.email
    )
    
    // Get audit events for this member
    const memberAuditEvents = auditEvents.filter(event => {
      const metadata = event.metadata as any
      return metadata.user_email === member.email || metadata.assigned_user === member.name
    })

    // Calculate various performance metrics
    const totalAssignedIssues = assignedIssues.length
    const resolvedIssues = assignedIssues.filter(issue => issue.status === 'Closed').length
    const inProgressIssues = assignedIssues.filter(issue => issue.status === 'In Progress').length
    const openIssues = assignedIssues.filter(issue => issue.status === 'Open').length
    
    // Calculate resolution rate
    const resolutionRate = totalAssignedIssues > 0 ? (resolvedIssues / totalAssignedIssues) * 100 : 0
    
    // Calculate average resolution time
    const resolvedIssuesWithTime = assignedIssues.filter(issue => 
      issue.status === 'Closed' && issue.date_created && issue.date_resolved
    )
    const totalResolutionTime = resolvedIssuesWithTime.reduce((acc, issue) => {
      const created = new Date(issue.date_created)
      const resolved = new Date(issue.date_resolved)
      return acc + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) // days
    }, 0)
    const avgResolutionTime = resolvedIssuesWithTime.length > 0 ? totalResolutionTime / resolvedIssuesWithTime.length : 0
    
    // Calculate activity score based on audit events
    const activityScore = memberAuditEvents.length * 10 // 10 points per activity
    
    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentAuditEvents = memberAuditEvents.filter(event => 
      new Date(event.created_at) > sevenDaysAgo
    )
    const recentActivityScore = recentAuditEvents.length * 15 // 15 points per recent activity
    
    // Calculate overall performance score
    const baseScore = member.performance || 0
    const resolutionScore = resolutionRate * 0.3 // 30% weight
    const speedScore = avgResolutionTime > 0 ? Math.max(0, 100 - (avgResolutionTime * 10)) * 0.2 : 0 // 20% weight, faster = higher score
    const activityScoreWeighted = activityScore * 0.25 // 25% weight
    const recentActivityScoreWeighted = recentActivityScore * 0.25 // 25% weight
    
    const calculatedScore = Math.round(
      resolutionScore + 
      speedScore + 
      activityScoreWeighted + 
      recentActivityScoreWeighted
    )
    
    return {
      totalAssignedIssues,
      resolvedIssues,
      inProgressIssues,
      openIssues,
      resolutionRate: Math.round(resolutionRate),
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      activityScore,
      recentActivityScore,
      calculatedScore: Math.min(100, Math.max(0, calculatedScore)),
      recentAuditEvents: recentAuditEvents.length,
      totalAuditEvents: memberAuditEvents.length
    }
  }

  const getRankedTeamMembers = () => {
    return teamMembers
      .map(member => ({
        ...member,
        performanceData: calculateMemberPerformance(member)
      }))
      .sort((a, b) => b.performanceData.calculatedScore - a.performanceData.calculatedScore)
      .map((member, index) => ({
        ...member,
        rank: index + 1
      }))
  }

  const getPerformanceBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800'
    if (score >= 80) return 'bg-blue-100 text-blue-800'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800'
    if (score >= 60) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getPerformanceBadgeText = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 70) return 'Average'
    if (score >= 60) return 'Below Average'
    return 'Poor'
  }

  // Helper function to get steward activity data (following operational dashboard pattern)
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

  // Helper function to get status badge styling for compliance records
  const getComplianceStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Quickly Resolved':
        return 'bg-green-100 text-green-800'
      case 'Resolved This Week':
        return 'bg-blue-100 text-blue-800'
      case 'Resolved':
        return 'bg-gray-100 text-gray-800'
      case 'Recently Started':
        return 'bg-yellow-100 text-yellow-800'
      case 'In Progress':
        return 'bg-orange-100 text-orange-800'
      case 'Long Running':
        return 'bg-red-100 text-red-800'
      case 'New Issue':
        return 'bg-purple-100 text-purple-800'
      case 'Recent Issue':
        return 'bg-indigo-100 text-indigo-800'
      case 'Stale Issue':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper function to format audit event data for compliance activities
  const formatComplianceAuditEvent = (event: AuditEvent) => {
    const metadata = event.metadata as any
    const timestamp = new Date(event.created_at)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    let timeAgo = ''
    if (diffInDays > 0) {
      timeAgo = `${diffInDays} Day${diffInDays > 1 ? 's' : ''} ago`
    } else if (diffInHours > 0) {
      timeAgo = `${diffInHours} Hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      timeAgo = 'Just now'
    }

    switch (event.action) {
      case 'issue_assigned':
        return {
          title: `Issue ${metadata.issue_id} Assigned`,
          description: `${metadata.assigned_user} assigned to ${metadata.issue_type} issue for ${metadata.entity}`,
          color: 'bg-purple-500',
          tags: ['User Assignment', metadata.entity],
          timeAgo
        }
      case 'issue_resolved':
        return {
          title: `Issue ${metadata.issue_id} Resolved`,
          description: `${metadata.resolved_by} resolved ${metadata.issue_type} issue for ${metadata.entity}`,
          color: 'bg-green-500',
          tags: ['Issue Resolution', metadata.entity],
          timeAgo
        }
      case 'issue_status_updated':
        return {
          title: `Issue ${metadata.issue_id} Status Updated`,
          description: `${metadata.updated_by} changed status from ${metadata.old_status} to ${metadata.new_status}`,
          color: 'bg-blue-500',
          tags: ['Status Update', metadata.new_status],
          timeAgo
        }
      case 'issue_created':
        return {
          title: `New Issue ${metadata.issue_id} Created`,
          description: `System detected ${metadata.issue_type} issue for ${metadata.entity}`,
          color: 'bg-yellow-500',
          tags: ['Issue Detection', metadata.entity],
          timeAgo
        }
      case 'issue_escalated':
        return {
          title: `Issue ${metadata.issue_id} Escalated`,
          description: `${metadata.escalated_by} escalated ${metadata.issue_type} issue due to ${metadata.escalation_reason}`,
          color: 'bg-red-500',
          tags: ['Escalation', metadata.severity],
          timeAgo
        }
      case 'issue_comment_added':
        return {
          title: `Comment Added to ${metadata.issue_id}`,
          description: `${metadata.comment_by} added comment: "${metadata.comment_text?.substring(0, 50)}${metadata.comment_text?.length > 50 ? '...' : ''}"`,
          color: 'bg-indigo-500',
          tags: ['Comment', metadata.entity],
          timeAgo
        }
      case 'issue_priority_changed':
        return {
          title: `Issue ${metadata.issue_id} Priority Changed`,
          description: `${metadata.changed_by} changed priority from ${metadata.old_priority} to ${metadata.new_priority}`,
          color: 'bg-orange-500',
          tags: ['Priority Change', metadata.new_priority],
          timeAgo
        }
      case 'user_added':
        return {
          title: 'New User Added',
          description: `${metadata.user_name} (${metadata.user_email}) added to system as ${metadata.user_role}`,
          color: 'bg-blue-500',
          tags: ['User Management', metadata.user_role],
          timeAgo
        }
      case 'user_role_updated':
        return {
          title: 'User Role Updated',
          description: `${metadata.user_name} role changed from ${metadata.old_role} to ${metadata.new_role}`,
          color: 'bg-yellow-500',
          tags: ['Role Update', metadata.new_role],
          timeAgo
        }
      case 'user_deleted':
        return {
          title: 'User Removed',
          description: `${metadata.user_name} (${metadata.user_email}) removed from system`,
          color: 'bg-red-500',
          tags: ['User Management', 'Removal'],
          timeAgo
        }
      default:
        // Filter out non-compliance related events
        if (event.action.includes('ai_insights') || event.action.includes('dashboard')) {
          return null
        }
        return {
          title: event.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: metadata.description || 'Compliance action performed',
          color: 'bg-gray-500',
          tags: ['Compliance Action'],
          timeAgo
        }
    }
  }

  const handleAddUser = async () => {
    if (newUser.email && newUser.name) {
      try {
        // Generate a temporary firebase_uid that will be updated when user logs in
        const tempUid = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const { data, error } = await supabase
          .from('users')
          .insert({
            firebase_uid: tempUid,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            email_verified: false
          })
          .select()

        if (error) {
          console.error('Error adding user:', error)
          return
        }

        if (data) {
          setUsers([data[0], ...users])
          
          // Create audit entry
          await createAuditEntry('user_added', {
            user_email: newUser.email,
            user_name: newUser.name,
            user_role: newUser.role,
            temp_uid: tempUid
          })
        }

        setNewUser({ email: "", name: "", role: "dataTeam" })
        setIsAddUserDialogOpen(false)
      } catch (error) {
        console.error('Error adding user:', error)
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const user = users.find(u => u.firebase_uid === userId)

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('firebase_uid', userId)

      if (error) {
        console.error('Error deleting user:', error)
        return
      }

      // Create audit entry
      await createAuditEntry('user_deleted', {
        user_email: user?.email,
        user_name: user?.name,
        user_role: user?.role,
        user_id: userId
      })

      setUsers(users.filter(user => user.firebase_uid !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: Database['public']['Tables']['users']['Row']['role']) => {
    try {
      const user = users.find(u => u.firebase_uid === userId)
      const oldRole = user?.role

      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('firebase_uid', userId)

      if (error) {
        console.error('Error updating user role:', error)
        return
      }

      // Create audit entry
      await createAuditEntry('user_role_updated', {
        user_email: user?.email,
        user_name: user?.name,
        old_role: oldRole,
        new_role: newRole,
        user_id: userId
      })

      setUsers(users.map(user => 
        user.firebase_uid === userId 
          ? { ...user, role: newRole }
          : user
      ))
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleAssignUserToIssue = async (issueId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('compliance_issues')
        .update({ assignee: userId })
        .eq('issue_id', issueId)

      if (error) {
        console.error('Error assigning user to issue:', error)
        return
      }

      // Get user and issue details for audit trail
      const assignedUser = users.find(user => user.firebase_uid === userId)
      const issue = complianceIssues.find(issue => issue.issue_id === issueId)

      // Create audit entry
      await createAuditEntry('issue_assigned', {
        issue_id: issueId,
        issue_type: issue?.issue_type,
        entity: issue?.entity,
        assigned_user: assignedUser?.name || assignedUser?.email,
        assigned_user_id: userId,
        previous_assignee: issue?.assignee || 'unassigned'
      })

      setComplianceIssues(complianceIssues.map(issue => 
        issue.issue_id === issueId 
          ? { ...issue, assignee: userId }
          : issue
      ))
      setIsAssignUserDialogOpen(false)
      setSelectedIssue(null)
    } catch (error) {
      console.error('Error assigning user to issue:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Team Members"
            value={teamMembers.length.toString()}
            icon={Users}
            iconColor="text-blue-500"
            change={{ value: `${teamMembers.filter(m => m.status === 'active').length} active`, isPositive: true }}
          />
          <KPICard
            title="Active Issues"
            value={complianceIssues.length.toString()}
            icon={AlertTriangle}
            iconColor="text-red-500"
            change={{ value: `${complianceIssues.filter(i => i.status === 'In Progress').length} in progress`, isPositive: false }}
          />
          <KPICard
            title="Avg. Performance"
            value={`${Math.round(teamMembers.reduce((acc, m) => acc + m.performance, 0) / teamMembers.length)}%`}
            icon={TrendingUp}
            iconColor="text-green-500"
            change={{ value: "+5% from last month", isPositive: true }}
          />
          <KPICard
            title="Resolution Rate"
            value="87%"
            icon={CheckCircle}
            iconColor="text-purple-500"
            progress={87}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="user-management" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="user-management">User Management</TabsTrigger>
            <TabsTrigger value="issue-tracking">Issue Tracking</TabsTrigger>
            <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="user-management" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>System Users</CardTitle>
                    <CardDescription>Manage users who can access the system</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddUserDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.firebase_uid}>
                        <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value: Database['public']['Tables']['users']['Row']['role']) => 
                              handleUpdateUserRole(user.firebase_uid, value)
                            }
                          >
                            <SelectTrigger className="w-52">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dataTeam">Data Team</SelectItem>
                              <SelectItem value="teamLead">Team Lead</SelectItem>
                              <SelectItem value="dataTeamLead">Data Team Lead</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            user.firebase_uid.startsWith('temp_') 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }>
                            {user.firebase_uid.startsWith('temp_') ? 'Pending' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.last_login_at 
                            ? new Date(user.last_login_at).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <ActionDropdown
                            itemId={user.firebase_uid}
                            actions={[
                              {
                                label: "View Details",
                                icon: Eye,
                                onClick: () => setSelectedUser(user)
                              },
                              {
                                label: "Delete User",
                                icon: UserX,
                                onClick: () => handleDeleteUser(user.firebase_uid),
                                variant: "destructive"
                              }
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issue Tracking Tab */}
          <TabsContent value="issue-tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Compliance Issues</CardTitle>
                    <CardDescription>Track and manage compliance issues across the team</CardDescription>
                  </div>
                  <SearchFilterBar
                    searchPlaceholder="Search Issues..."
                    filterOptions={[
                      { value: "high", label: "High Severity" },
                      { value: "medium", label: "Medium Severity" },
                      { value: "low", label: "Low Severity" },
                      { value: "in-progress", label: "In Progress" },
                      { value: "open", label: "Open" },
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
                        {complianceIssues.map((issue) => (
                          <TableRow key={issue.issue_id}>
                            <TableCell className="font-medium">{issue.issue_id}</TableCell>
                            <TableCell>{issue.issue_type}</TableCell>
                            <TableCell>{issue.entity}</TableCell>
                            <TableCell>
                              <StatusBadge status={issue.severity} variant="severity" />
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={issue.status} variant="status" />
                            </TableCell>
                            <TableCell>
                              {issue.assignee ? (
                                users.find(user => user.firebase_uid === issue.assignee)?.name || 
                                users.find(user => user.firebase_uid === issue.assignee)?.email || 
                                issue.assignee
                              ) : (
                                <span className="text-gray-500">Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell>{issue.date_created}</TableCell>
                            <TableCell>
                              <ActionDropdown
                                itemId={issue.issue_id}
                                actions={[
                                  {
                                    label: "Assign User",
                                    icon: Users,
                                    onClick: () => {
                                      setSelectedIssue(issue)
                                      setIsAssignUserDialogOpen(true)
                                    }
                                  }
                                ]}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                {/* Enhanced Pagination */}
                     {totalCount > 0 && (
                       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                         <div className="flex items-center gap-2 text-sm text-gray-600">
                           <span className="font-medium">Results</span>
                           <span className="text-gray-400">•</span>
                           <span>
                             Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
                             <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
                             <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span>
                           </span>
                         </div>
                         
                         <div className="flex items-center gap-1">
                           {/* Previous Button */}
                           <Button 
                             variant="outline" 
                             size="sm" 
                             disabled={currentPage === 1}
                             onClick={() => handlePageChange(currentPage - 1)}
                             className="h-8 px-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                           >
                             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                             </svg>
                             Previous
                           </Button>
                           
                           {/* Page Numbers */}
                           <div className="flex items-center gap-1 mx-2">
                             {getPageNumbers().map((page, index) => (
                               page === '...' ? (
                                 <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-400">
                                   •••
                                 </span>
                               ) : (
                                 <Button
                                   key={page}
                                   variant={currentPage === page ? "default" : "outline"}
                                   size="sm"
                                   onClick={() => handlePageChange(page as number)}
                                   className={`h-8 w-8 p-0 text-sm font-medium ${
                                     currentPage === page 
                                       ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                                       : 'text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                   }`}
                                 >
                                   {page}
                                 </Button>
                               )
                             ))}
                           </div>
                           
                           {/* Next Button */}
                           <Button 
                             variant="outline" 
                             size="sm" 
                             disabled={currentPage === totalPages || totalPages === 0}
                             onClick={() => handlePageChange(currentPage + 1)}
                             className="h-8 px-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                           >
                             Next
                             <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                             </svg>
                           </Button>
                         </div>
                       </div>
                     )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit-trail" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete History of Compliance Actions</CardTitle>
                <CardDescription>
                  Complete history of compliance actions and changes across all team members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {auditLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading compliance audit trail...</span>
                    </div>
                  </div>
                ) : auditEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No compliance audit events found</p>
                    <p className="text-xs mt-1">Compliance actions will appear here as team members perform activities</p>
                  </div>
                ) : (
                  auditEvents
                    .map((event) => {
                      const formattedEvent = formatComplianceAuditEvent(event)
                      return formattedEvent ? { event, formattedEvent } : null
                    })
                    .filter((item): item is { event: AuditEvent; formattedEvent: any } => item !== null)
                    .map(({ event, formattedEvent }) => (
                      <div key={`${event.id}-${event.created_at}`} className="flex justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className={`w-3 h-3 ${formattedEvent.color} rounded-full mt-1`}></div>
                          <div>
                            <p className="font-medium text-sm">
                              {formattedEvent.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formattedEvent.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {formattedEvent.tags.map((tag: string, tagIndex: number) => (
                                <Badge key={tagIndex} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 whitespace-nowrap">{formattedEvent.timeAgo}</p>
                      </div>
                    ))
                )}
                <Pagination
                currentPage={auditCurrentPage}
                totalPages={auditTotalPages}
                totalCount={auditTotalCount}
                startItem={auditStartItem}
                endItem={auditEndItem}
                onPageChange={handleAuditPageChange}
                getPageNumbers={getAuditPageNumbers}
              />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>
                  Data team members performance and activity rankings
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
                  (() => {
                    // Filter to show only dataTeam members
                    const dataTeamMembers = teamMembers.filter(member => member.role === 'dataTeam')
                    
                    // Sort by performance to identify top performer
                    const sortedMembers = dataTeamMembers
                      .map(member => ({
                        ...member,
                        activity: getStewardActivity(member)
                      }))
                      .sort((a, b) => b.activity.performance - a.activity.performance)
                    
                    if (dataTeamMembers.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No data team members found</p>
                          <p className="text-xs mt-1">Data team members will appear here when they are added to the system</p>
                        </div>
                      )
                    }
                    
                    return sortedMembers.slice(0, 5).map((member, index) => {
                      const status = getActivityStatus(member)
                      const initials = getInitials(member.name)
                      const avatarColor = getAvatarColor(member.name)
                      const isTopPerformer = index === 0 // First member after sorting by performance
                      
                      return (
                        <div key={member.id} className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 ${isTopPerformer ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 ${avatarColor} rounded-full flex items-center justify-center font-bold text-xs relative`}>
                              {initials}
                              {isTopPerformer && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <span className="text-xs">⭐</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{member.name}</p>
                                {isTopPerformer && (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                    Top Performer
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600">
                                {member.activity.resolvedThisWeek > 0 
                                  ? `Resolved ${member.activity.resolvedThisWeek} issues this week`
                                  : member.activity.pendingReviews > 0
                                    ? `${member.activity.pendingReviews} pending reviews`
                                    : member.activity.inProgress > 0
                                      ? `${member.activity.inProgress} in progress`
                                      : `${member.activity.totalAssigned} assigned issues`
                                }
                              </p>
                              <p className="text-xs text-gray-500">
                                Role: Data Team
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
                  })()
                )}
                
                {(() => {
                  const dataTeamMembers = teamMembers.filter(member => member.role === 'dataTeam')
                  return dataTeamMembers.length > 5 && (
                    <div className="text-center pt-2">
                      <p className="text-xs text-gray-500">
                        +{dataTeamMembers.length - 5} more data team members
                      </p>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Permissions</CardTitle>
                <CardDescription>Overview of user roles and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Permissions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.firebase_uid}>
                          <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                          <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                          <TableCell>
                            <Badge className="capitalize">
                              {user.role?.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.role === 'dataTeamLead' ? (
                                <>
                                  <Badge variant="outline" className="text-xs">All Permissions</Badge>
                                </>
                              ) : user.role === 'teamLead' ? (
                                <>
                                  <Badge variant="outline" className="text-xs">Manage Team</Badge>
                                  <Badge variant="outline" className="text-xs">View Reports</Badge>
                                </>
                              ) : (
                                <>
                                  <Badge variant="outline" className="text-xs">View Issues</Badge>
                                  <Badge variant="outline" className="text-xs">Basic Access</Badge>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

 
      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add System User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. They will be able to log in once added.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select
                value={newUser.role}
                onValueChange={(value: Database['public']['Tables']['users']['Row']['role']) => 
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dataTeam">Data Team</SelectItem>
                  <SelectItem value="teamLead">Team Lead</SelectItem>
                  <SelectItem value="dataTeamLead">Data Team Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog open={isAssignUserDialogOpen} onOpenChange={setIsAssignUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign User to Issue</DialogTitle>
            <DialogDescription>
              Select a user to assign to this compliance issue: {selectedIssue?.issue_id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Issue Details</label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm"><strong>Type:</strong> {selectedIssue?.issue_type}</p>
                <p className="text-sm"><strong>Entity:</strong> {selectedIssue?.entity}</p>
                <p className="text-sm"><strong>Severity:</strong> {selectedIssue?.severity}</p>
                <p className="text-sm"><strong>Current Assignee:</strong> {
                  selectedIssue?.assignee ? (
                    users.find(user => user.firebase_uid === selectedIssue.assignee)?.name || 
                    users.find(user => user.firebase_uid === selectedIssue.assignee)?.email || 
                    selectedIssue.assignee
                  ) : 'Unassigned'
                }</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Select User to Assign</label>
              <Select
                onValueChange={(value) => {
                  if (selectedIssue) {
                    handleAssignUserToIssue(selectedIssue.issue_id, value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.firebase_uid} value={user.firebase_uid}>
                      {user.name || user.email} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAssignUserDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button removed - using users table instead */}
    </div>
  )
}
