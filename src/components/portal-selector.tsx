"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Database,
  ArrowRight,
  Activity,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  LogOut,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../firebaseConfig" // Adjust path as needed

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"

export default function PortalSelector() {
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      // 1. Call backend logout to clear session cookie
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      })

      // 2. Sign out from Firebase Auth
      await signOut(auth)
      
      // 3. Redirect to login
      navigate("/login", { replace: true })
    } catch (error) {
      console.error("Logout error:", error)
      // Still redirect to login even if logout fails
      navigate("/login", { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SyncMate Portal Selection</h1>
              <p className="text-gray-600 text-lg">Choose your portal to access your workspace</p>
            </div>
            
            {/* Logout Button */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:border-red-300"
              >
                <LogOut className="w-4 h-4" />
                {loggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Portal Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Team Lead Portal */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Team Lead Portal</CardTitle>
                  <CardDescription className="text-base">
                    Access compliance operations and strategic insights dashboards
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Available Dashboards */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Available Dashboards:</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span>Compliance Operations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    <span>Strategic Insights</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Quick Overview:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">12 Reports This Week</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +2
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">11 Active Issues</span>
                    </div>
                    <Badge variant="outline" className="text-yellow-700">
                      +4
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">₱8.2B Opportunities</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      +18%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full" 
                size="lg" 
                onClick={() => navigate('/team-lead-portal')}
              >
                Access Team Lead Portal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Data Team Portal */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Data Team Portal</CardTitle>
                  <CardDescription className="text-base">
                    Access data operations and governance dashboard
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Available Dashboards */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Available Dashboards:</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Database className="w-4 h-4 text-green-500" />
                    <span>Data Team Operations</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Quick Overview:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">23 Active Issues</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      +3
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">87% Resolution Rate</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      +5%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">2.3d Avg Resolution</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      -0.5d
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full" 
                size="lg" 
                onClick={() => navigate('/data-team-portal')}
              >
                Access Data Team Portal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Portal Information
              </CardTitle>
              <CardDescription>
                Choose the appropriate portal based on your role and responsibilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Team Lead Portal</h4>
                  <p className="text-sm text-gray-600">
                    For team leads and managers who need to monitor compliance operations, 
                    track team performance, and explore strategic business opportunities.
                  </p>
                  <div className="text-sm text-gray-500">
                    <strong>Includes:</strong> Compliance Operations, Strategic Insights
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Data Team Portal</h4>
                  <p className="text-sm text-gray-600">
                    For data team members who need to track compliance issues, 
                    manage resolution workflows, and monitor data governance.
                  </p>
                  <div className="text-sm text-gray-500">
                    <strong>Includes:</strong> Data Team Operations
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