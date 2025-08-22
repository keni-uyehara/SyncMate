"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertTriangle,
  FileText,
  Target,
  Users,
  Activity,
  Building,
  BarChart3,
  ArrowRight,
  Clock,
  CheckCircle,
  Lightbulb,
  Shield,
  UserPlus,
  Settings,
} from "lucide-react"
import DataTeamLeadPortalNavigation from "./data-team-lead-portal-navigation"

export default function DataTeamLeadPortal() {
  const [selectedDashboard, setSelectedDashboard] = useState<"dashboard" | null>(null)

  // If a dashboard is selected, render the navigation component
  if (selectedDashboard) {
    return <DataTeamLeadPortalNavigation initialView={selectedDashboard} />
  }

  // Landing page with dashboard selection
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#B11216] -mb-2 tracking-tight">SyncMate</h1>
              <p className="text-l text-[#E6B54B] tracking-wide">Data Team Lead Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Shield className="w-3 h-3 mr-1" />
                Admin Access
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Data Team Management</h2>
          <p className="text-gray-600 text-lg">
            Manage your data team, roles, permissions, and compliance operations from a centralized dashboard.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+1</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">11</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">+3</span> new this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">91%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+2%</span> improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Management Dashboard */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedDashboard("dashboard")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Team Management Dashboard</CardTitle>
                    <CardDescription>Manage team members, roles, and permissions</CardDescription>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Team Members</span>
                  <span className="font-medium">4 Active</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Roles Defined</span>
                  <span className="font-medium">4 Roles</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Permissions</span>
                  <span className="font-medium">7 Types</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  <UserPlus className="w-3 h-3 mr-1" />
                  Add Members
                </Badge>
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  <Shield className="w-3 h-3 mr-1" />
                  Manage Roles
                </Badge>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                  <Settings className="w-3 h-3 mr-1" />
                  Permissions
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Team Member
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Create Custom Role
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Review Permissions
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Team Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                View Performance Metrics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Team Activity</CardTitle>
              <CardDescription>Latest updates and changes in your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Carlos Mendoza added to team</p>
                    <p className="text-sm text-gray-600">Assigned role: Data Steward</p>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Role permissions updated</p>
                    <p className="text-sm text-gray-600">Senior Analyst role modified</p>
                  </div>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Performance review completed</p>
                    <p className="text-sm text-gray-600">Team average: 91%</p>
                  </div>
                  <span className="text-xs text-gray-500">3 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
