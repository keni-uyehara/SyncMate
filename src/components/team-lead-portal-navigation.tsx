"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Bell, User, LogOut } from "lucide-react"

import TeamLeadDashboard from "../pages/team lead/team-lead-compliance-dashboard"
import InsightsDashboard from "../pages/team lead/team-lead-insights-dashboard"
import { doLogout } from "../utils/logout"

export default function TeamLeadPortalNavigation({
  initialView,
}: {
  initialView: "compliance" | "insights"
}) {
  const [activeView, setActiveView] = useState<"compliance" | "insights">(initialView)

  // Keep activeView in sync with initialView if prop changes
  useEffect(() => {
    setActiveView(initialView)
  }, [initialView])

  const NavigationHeader = () => (
    <div className="bg-white border-b">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between relative">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#B11216] -mb-2 tracking-tight">SyncMate</h1>
              <p className="text-l text-[#E6B54B] tracking-wide">Team Lead</p>
            </div>
          </div>

          {/* Center: Menu */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveView("compliance")}
              className={`pb-2 font-medium transition-colors ${
                activeView === "compliance"
                  ? "border-b-2 border-[#B11216] text-[#B11216]"
                  : "border-b-2 border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Compliance Operations
            </button>
            <button
              type="button"
              onClick={() => setActiveView("insights")}
              className={`pb-2 font-medium transition-colors ${
                activeView === "insights"
                  ? "border-b-2 border-[#B11216] text-[#B11216]"
                  : "border-b-2 border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Strategic Insights
            </button>
          </div>

          {/* Right: Icons */}
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
      {activeView === "compliance" ? <TeamLeadDashboard /> : <InsightsDashboard />}
    </div>
  )
}
