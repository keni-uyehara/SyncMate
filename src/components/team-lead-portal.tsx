"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertTriangle,
  FileText,
  Target,
  DollarSign,
  Activity,
  Building,
  BarChart3,
  ArrowRight,
  Clock,
  CheckCircle,
  Lightbulb,
} from "lucide-react"
import TeamLeadPortalNavigation from "./team-lead-portal-navigation"

export default function TeamLeadPortal() {
  const [selectedDashboard, setSelectedDashboard] = useState<"compliance" | "insights" | null>(null)

  // If a dashboard is selected, render the navigation component
  if (selectedDashboard) {
    return <TeamLeadPortalNavigation initialView={selectedDashboard} onBack={() => setSelectedDashboard(null)} />
  }

  // Landing page with dashboard selection
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SyncMate Team Lead Portal</h1>
            <p className="text-gray-600 text-lg">Choose your workspace to get started</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports This Week</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+2</span> from last week
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
                <span className="text-red-500">+4</span> new this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Opportunities</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱8.2B</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+18%</span> potential growth
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">91%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+5%</span> efficiency gain
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Compliance Operations Dashboard */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Compliance Operations</CardTitle>
                  <CardDescription className="text-base">
                    Monitor compliance issues, manage reports, and track team performance
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
                    <span>Report Management & Upload</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Issue Monitoring & Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Weekly Performance Summaries</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Team Workload Distribution</span>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Current Status:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-green-600" />
                      <span className="text-sm">BPI x Ayala Land</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      92% Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">BPI x Globe</span>
                    </div>
                    <Badge variant="outline" className="text-yellow-700">
                      78% Attention
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-green-600" />
                      <span className="text-sm">BPI x AC Energy</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      95% Excellent
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button className="w-full" size="lg" onClick={() => setSelectedDashboard("compliance")}>
                Access Compliance Operations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Strategic Insights Dashboard */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Strategic Insights</CardTitle>
                  <CardDescription className="text-base">
                    Explore business opportunities, market trends, and strategic recommendations
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
                    <span>Synergy Opportunities Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Customer Insights & Segmentation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Market Analysis & Trends</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>AI-Powered Recommendations</span>
                  </div>
                </div>
              </div>

              {/* Top Opportunities */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Top Opportunities:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-green-600" />
                      <span className="text-sm">EcoHome Package</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ₱1.8B Ready
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Housing Bundle</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      ₱2.3B Q2 2024
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Digital Banking</span>
                    </div>
                    <Badge variant="outline" className="text-yellow-700">
                      ₱890M Dev
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button className="w-full" size="lg" onClick={() => setSelectedDashboard("insights")}>
                Access Strategic Insights
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
                <Clock className="w-5 h-5 text-blue-500" />
                Recent Activity Across Team Lead Systems
              </CardTitle>
              <CardDescription>
                Latest updates from compliance operations and strategic initiatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">EcoHome Package Approved for Launch</p>
                      <span className="text-sm text-muted-foreground">1 hour ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AC Energy partnership reached 95% readiness - ₱1.8B revenue potential
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      Strategic Insights
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Weekly Compliance Report Processed</p>
                      <span className="text-sm text-muted-foreground">2 hours ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Maria Santos completed BPI x Ayala Land weekly summary - 3 issues flagged
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      Compliance Operations
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Globe Integration Issues Detected</p>
                      <span className="text-sm text-muted-foreground">4 hours ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      7 data alignment issues affecting digital banking timeline - requires attention
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      Compliance Operations
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
