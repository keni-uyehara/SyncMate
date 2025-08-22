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
import { supabase } from "@/supabaseClient"
import type { Database } from "@/types/database.types"

import {
  AlertTriangle,
  Eye,
  X,
  CheckCircle,
  Loader2,
  Users,
  UserPlus,
  Shield,
  Settings,
  Activity,
  TrendingUp,
  UserX
} from "lucide-react"

type TeamMember = Database['public']['Tables']['team_members']['Row'] & {
  permissions: string[]
}

type Role = Database['public']['Tables']['roles']['Row']

type ComplianceIssue = Database['public']['Tables']['compliance_issues']['Row']

export default function DataTeamLeadDashboard() {
  const [complianceIssues, setComplianceIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [users, setUsers] = useState<Database['public']['Tables']['users']['Row'][]>([])

  const [roles, setRoles] = useState<Role[]>([])

  // Role Management State
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false)
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedUser, setSelectedUser] = useState<Database['public']['Tables']['users']['Row'] | null>(null)
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
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch team members
      const { data: teamMembersData, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false })

      if (teamError) {
        console.error('Error fetching team members:', teamError)
      } else {
        // Add permissions to team members based on their roles
        const membersWithPermissions = (teamMembersData || []).map(member => ({
          ...member,
          permissions: getPermissionsForRole(member.role)
        }))
        setTeamMembers(membersWithPermissions)
      }

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false })

      if (rolesError) {
        console.error('Error fetching roles:', rolesError)
      } else {
        setRoles(rolesData || [])
      }

      // Fetch compliance issues
      const { data: issuesData, error: issuesError } = await supabase
        .from('compliance_issues')
        .select('*')
        .order('date_created', { ascending: false })
        .limit(50)

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

  const getPermissionsForRole = (role: string): string[] => {
    switch (role) {
      case 'data_analyst':
        return ['view_issues', 'edit_issues']
      case 'data_steward':
        return ['view_issues', 'edit_issues', 'resolve_issues']
      case 'senior_analyst':
        return ['view_issues', 'edit_issues', 'generate_reports', 'manage_workflows']
      case 'team_lead':
        return ['view_issues', 'edit_issues', 'resolve_issues', 'generate_reports', 'manage_workflows', 'manage_roles', 'manage_users']
      default:
        return ['view_issues']
    }
  }

  const handleAddMember = async () => {
    if (newMember.name && newMember.email) {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .insert({
            name: newMember.name,
            email: newMember.email,
            role: newMember.role,
            status: 'pending',
            assigned_issues: 0,
            performance: 0
          })
          .select()

        if (error) {
          console.error('Error adding team member:', error)
          return
        }

        if (data) {
          const newMemberWithPermissions = {
            ...data[0],
            permissions: getPermissionsForRole(newMember.role)
          }
          setTeamMembers([newMemberWithPermissions, ...teamMembers])
        }

        setNewMember({ name: "", email: "", role: "data_analyst" })
        setIsAddMemberDialogOpen(false)
      } catch (error) {
        console.error('Error adding team member:', error)
      }
    }
  }

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
      case 'data_analyst': return 'Data Analyst'
      case 'data_steward': return 'Data Steward'
      case 'senior_analyst': return 'Senior Analyst'
      case 'team_lead': return 'Team Lead'
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
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('firebase_uid', userId)

      if (error) {
        console.error('Error deleting user:', error)
        return
      }

      setUsers(users.filter(user => user.firebase_uid !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: Database['public']['Tables']['users']['Row']['role']) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('firebase_uid', userId)

      if (error) {
        console.error('Error updating user role:', error)
        return
      }

      setUsers(users.map(user => 
        user.firebase_uid === userId 
          ? { ...user, role: newRole }
          : user
      ))
    } catch (error) {
      console.error('Error updating user role:', error)
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

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Activity className="w-4 h-4" />
            )}
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="user-management" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="user-management">User Management</TabsTrigger>
            <TabsTrigger value="issue-tracking">Issue Tracking</TabsTrigger>
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
                            <SelectTrigger className="w-32">
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
                          <TableCell>{issue.assignee}</TableCell>
                          <TableCell>{issue.date_created}</TableCell>
                          <TableCell>
                            <ActionDropdown
                              itemId={issue.issue_id}
                              actions={[
                                {
                                  label: "View Details",
                                  icon: Eye,
                                  onClick: () => console.log(`View issue ${issue.issue_id}`)
                                },
                                {
                                  label: "Reassign",
                                  icon: Users,
                                  onClick: () => console.log(`Reassign issue ${issue.issue_id}`)
                                }
                              ]}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance Overview</CardTitle>
                  <CardDescription>Performance metrics for each team member</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-blue-600">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-600">{getRoleDisplayName(member.role)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{member.performance}%</p>
                                                     <p className="text-xs text-gray-600">{member.assigned_issues} issues</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Team performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                    <div className="text-center">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Performance charts would appear here</p>
                      <p className="text-sm text-gray-400">Integration with Chart.js or Recharts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
                <CardDescription>Overview of permissions across all roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission</TableHead>
                        <TableHead>Description</TableHead>
                        {roles.map((role) => (
                          <TableHead key={role.id}>{role.name}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availablePermissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell className="font-medium">{permission.name}</TableCell>
                          <TableCell className="text-sm text-gray-600">{permission.description}</TableCell>
                          {roles.map((role) => (
                            <TableCell key={role.id}>
                              {role.permissions.includes(permission.id) ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400" />
                              )}
                            </TableCell>
                          ))}
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

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to your data team with appropriate role and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select
                value={newMember.role}
                onValueChange={(value: TeamMember['role']) => setNewMember({ ...newMember, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data_analyst">Data Analyst</SelectItem>
                  <SelectItem value="data_steward">Data Steward</SelectItem>
                  <SelectItem value="senior_analyst">Senior Analyst</SelectItem>
                  <SelectItem value="team_lead">Team Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember}>
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
            <DialogDescription>
              {selectedRole ? 'Modify role permissions and settings.' : 'Create a new role with custom permissions.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Role Name</label>
              <Input
                value={selectedRole?.name || ''}
                onChange={(e) => setSelectedRole(selectedRole ? { ...selectedRole, name: e.target.value } : null)}
                placeholder="Enter role name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={selectedRole?.description || ''}
                onChange={(e) => setSelectedRole(selectedRole ? { ...selectedRole, description: e.target.value } : null)}
                placeholder="Enter role description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Permissions</label>
              <div className="space-y-2 mt-2">
                {availablePermissions.map((permission) => (
                  <label key={permission.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedRole?.permissions.includes(permission.id) || false}
                      onChange={(e) => {
                        if (selectedRole) {
                          const newPermissions = e.target.checked
                            ? [...selectedRole.permissions, permission.id]
                            : selectedRole.permissions.filter(p => p !== permission.id)
                          setSelectedRole({ ...selectedRole, permissions: newPermissions })
                        }
                      }}
                    />
                    <span className="text-sm">{permission.name}</span>
                    <span className="text-xs text-gray-500">- {permission.description}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsEditRoleDialogOpen(false)}>
                {selectedRole ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permissions - {selectedMember?.name || 'Unknown'}</DialogTitle>
            <DialogDescription>
              Modify permissions for this team member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Role</label>
              <p className="text-sm text-gray-600">{selectedMember ? getRoleDisplayName(selectedMember.role) : ''}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Permissions</label>
              <div className="space-y-2 mt-2">
                {availablePermissions.map((permission) => (
                  <label key={permission.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedMember?.permissions.includes(permission.id) || false}
                      onChange={(e) => {
                        if (selectedMember) {
                          const newPermissions = e.target.checked
                            ? [...selectedMember.permissions, permission.id]
                            : selectedMember.permissions.filter(p => p !== permission.id)
                          setSelectedMember({ ...selectedMember, permissions: newPermissions })
                        }
                      }}
                    />
                    <span className="text-sm">{permission.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsPermissionDialogOpen(false)}>
                Update Permissions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => setIsAddMemberDialogOpen(true)}
        >
          <UserPlus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
