import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import { Navigate } from 'react-router-dom'
import React from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5173"

export default function RoleBasedRedirect() {
  const [status, setStatus] = React.useState<'loading'|'ready'|'error'>('loading')
  const [role, setRole] = React.useState<"dataTeam" | "teamLead" | null>(null)

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setStatus('error'); return } // not signed in (shouldn't happen inside ProtectedRoute)
      try {
        // Try to get role from custom claims first
        const tokenResult = await u.getIdTokenResult(true)
        const claimRole = tokenResult.claims.role as ("dataTeam"|"teamLead"|undefined)
        
        if (claimRole) {
          setRole(claimRole)
          setStatus('ready')
          return
        }
        
        // Fallback: try backend API
        try {
          let res = await fetch(`${API_BASE}/me`, { credentials: 'include' })
          if (!res.ok) {
            const idToken = await u.getIdToken()
            res = await fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${idToken}` } })
          }
          if (res.ok) {
            const me = await res.json()
            setRole(me.role)
            setStatus('ready')
            return
          }
        } catch (backendError) {
          console.warn('Backend not available, using default role:', backendError)
        }
        
        // Final fallback: use email-based role assignment
        const email = u.email?.toLowerCase() || ''
        if (email.includes('lead') || email.includes('manager') || email.includes('admin')) {
          setRole('teamLead')
        } else {
          setRole('dataTeam') // default role
        }
        setStatus('ready')
        
      } catch (error) {
        console.error('Error determining user role:', error)
        setStatus('error')
      }
    })
    return () => unsub()
  }, [])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading your workspace…</div>
  }

  // Don't loop back to /login on error; go neutral instead:
  if (status === 'error') return <Navigate to="/not-authorized" replace />

  return role === 'teamLead'
    ? <Navigate to="/team-lead" replace />
    : <Navigate to="/data-team" replace />
}
