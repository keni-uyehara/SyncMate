import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "./firebaseConfig"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"

export default function NotAuthorized() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      })
      await signOut(auth)
      navigate("/login", { replace: true })
    } catch (error) {
      console.error("Logout error:", error)
      navigate("/login", { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Access Denied
            </CardTitle>
            <CardDescription className="text-base">
              You don't have permission to access this portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>Your account doesn't have the required role to access this portal.</p>
              <p>Please contact your administrator if you believe this is an error.</p>
            </div>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout and try different account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}