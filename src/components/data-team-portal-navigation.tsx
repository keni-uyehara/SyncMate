"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Bell, User, Users, Shield, LogOut } from "lucide-react"
import DataTeamOperationalDashboard from "../pages/data team/data-team-operational-dashboard"
import { doLogout } from "../utils/logout"

export default function DataTeamPortalNavigation({
  initialView,
}: {
  initialView?: "operations"
}) {
  const [activeView, setActiveView] = useState<"operations">(initialView || "operations")

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
              <p className="text-l text-[#E6B54B] tracking-wide">Data Team</p>
            </div>
          </div>

          {/* Center: Menu */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveView("operations")}
              className={`pb-2 font-medium transition-colors ${
                activeView === "operations"
                  ? "border-b-2 border-[#B11216] text-[#B11216]"
                  : "border-b-2 border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Data Operations
            </button>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" title="Notifications">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Team Members">
              <Users className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Security">
              <Shield className="w-4 h-4" />
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
      <DataTeamOperationalDashboard />
    </div>
  )
}
