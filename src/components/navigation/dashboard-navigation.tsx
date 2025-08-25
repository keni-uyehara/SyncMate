"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Activity, BarChart3, Settings, Bell, User, Database, LogOut } from "lucide-react"
import TeamLeadDashboard from "../../pages/team lead/team-lead-compliance-dashboard"
import InsightsDashboard from "../../pages/team lead/team-lead-insights-dashboard"
import DataTeamOperationalDashboard from "../../pages/data team/data-team-operational-dashboard"
import { doLogout } from "../../utils/logout"

export default function DashboardNavigation() {
  const [activeView, setActiveView] = useState<"compliance" | "insights" | "data-team">("compliance")

  // Navigation Header Component (to avoid duplication)
  const NavigationHeader = () => (
    <div className="bg-white border-b">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">SyncMate Team Lead Portal</h1>
              <p className="text-sm text-gray-600">Compliance Operations & Strategic Insights</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeView === "compliance" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("compliance")}
                className="flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Compliance Operations
              </Button>
              <Button
                variant={activeView === "insights" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("insights")}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Strategic Insights
              </Button>
              <Button
                variant={activeView === "data-team" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("data-team")}
                className="flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Data Team Operations
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" title="Notifications">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Settings">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="User Profile">
              <User className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              title="Logout"
              onClick={doLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <NavigationHeader />
      {activeView === "compliance" ? (
        <TeamLeadDashboard />
      ) : activeView === "insights" ? (
        <InsightsDashboard />
      ) : (
        <DataTeamOperationalDashboard />
      )}
    </div>
  )
}