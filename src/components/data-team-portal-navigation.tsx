"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database, Settings, Bell, User } from "lucide-react"
import DataTeamOperationalDashboard from "../pages/data team/data-team-operational-dashboard"

export default function DataTeamPortalNavigation() {
  // Navigation Header Component
  const NavigationHeader = () => (
    <div className="bg-white border-b">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold text-[#B11216] -mb-2 tracking-tight">SyncMate</h1>
              <p className="text-xl font-normal text-[#E6B54B] tracking-wide">Data Team</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Data Team Operations
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
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
      <DataTeamOperationalDashboard />
    </div>
  )
}
