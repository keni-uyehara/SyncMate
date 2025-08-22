"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Bell, User, Users, Shield } from "lucide-react"
import DataTeamLeadDashboard from "../pages/data team/data-team-lead-dashboard"

export default function DataTeamLeadPortalNavigation({
  initialView,
}: {
  initialView?: "dashboard"
}) {
  const [activeView, setActiveView] = useState<"dashboard">(initialView || "dashboard")

  // Keep activeView in sync with initialView if prop changes
  useEffect(() => {
    if (initialView) {
      setActiveView(initialView)
    }
  }, [initialView])

  const NavigationHeader = () => (
    <div className="bg-white border-b">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between relative">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#B11216] -mb-2 tracking-tight">SyncMate</h1>
              <p className="text-l text-[#E6B54B] tracking-wide">Data Team Lead</p>
            </div>
          </div>

          {/* Center: Menu */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveView("dashboard")}
              className={`pb-2 font-medium transition-colors ${
                activeView === "dashboard"
                  ? "border-b-2 border-[#B11216] text-[#B11216]"
                  : "border-b-2 border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Team Management
            </button>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Users className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Shield className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <NavigationHeader />
      <DataTeamLeadDashboard />
    </div>
  )
}
