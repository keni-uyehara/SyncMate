"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertTriangle,
  Database,
  CheckCircle,
  Clock,
  ArrowRight,
  Activity,
  BarChart3,
  Target,
  FileText,
} from "lucide-react"
import DataTeamPortalNavigation from "./data-team-portal-navigation"

export default function DataTeamPortal() {
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null)

  // If a dashboard is selected, render the navigation component
  if (selectedDashboard) {
    return <DataTeamPortalNavigation />
  }

  // Landing page with dashboard selection
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SyncMate Data Team Portal</h1>
            <p className="text-gray-600 text-lg">Access your operational dashboard and data governance tools</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">+3</span> this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+5%</span> improvement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3d</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">-0.5d</span> faster
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Quality Score</CardTitle>
              <Database className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+2%</span> this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Selection Card */}
        <div className="max-w-4xl mx-auto">
          {/* Data Team Operational Dashboard */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Data Team Operations</CardTitle>
                  <CardDescription className="text-base">
                    Monitor compliance issues, track resolution workflows, and manage data governance
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Features */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Key Features:</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Compliance Issue Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Resolution Workflows</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Root Cause Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>AI-Powered Insights</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Data Quality Monitoring</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Performance Analytics</span>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Current Status:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">23 Active Issues</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      +3 this week
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">87% Resolution Rate</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      +5% improvement
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">2.3d Avg Resolution</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      -0.5d faster
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button className="w-full" size="lg" onClick={() => setSelectedDashboard("data-team")}>
                Access Data Team Operations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Summary */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Recent Data Team Activity
              </CardTitle>
              <CardDescription>
                Latest updates from data operations and issue resolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">BPI x Globe Data Alignment Issue Resolved</p>
                      <span className="text-sm text-muted-foreground">30 minutes ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Data team completed resolution of 7 alignment issues affecting digital banking timeline
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      Issue Resolution
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Weekly Data Quality Report Generated</p>
                      <span className="text-sm text-muted-foreground">2 hours ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automated quality assessment completed - 94% overall score with 3 areas flagged for improvement
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      Quality Monitoring
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">New Compliance Issues Detected</p>
                      <span className="text-sm text-muted-foreground">4 hours ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      3 new compliance issues identified in AC Energy integration - requires immediate attention
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      Issue Detection
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
