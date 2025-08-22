import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import { supabase } from '../supabaseClient'
import { Navigate } from 'react-router-dom'
import React from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5173"

export default function RoleBasedRedirect() {
  const [status, setStatus] = React.useState<'loading'|'ready'|'error'>('loading')
  const [role, setRole] = React.useState<"dataTeam" | "teamLead" | "dataTeamLead" | null>(null)

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setStatus('error'); return } // not signed in (shouldn't happen inside ProtectedRoute)
      try {
        // First, try to get role from Supabase users table
        if (u.email) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('email', u.email)
            .single()

          if (!userError && userData?.role) {
            console.log('Found user role in Supabase:', userData.role)
            setRole(userData.role as "dataTeam" | "teamLead" | "dataTeamLead")
            setStatus('ready')
            return
          } else {
            console.log('No user found in Supabase or error:', userError)
          }
        }

        // Fallback: try to get role from custom claims
        const tokenResult = await u.getIdTokenResult(true)
        const claimRole = tokenResult.claims.role as ("dataTeam"|"teamLead"|"dataTeamLead"|undefined)
        
        if (claimRole) {
          console.log('Found role in Firebase claims:', claimRole)
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
            console.log('Found role in backend API:', me.role)
            setRole(me.role)
            setStatus('ready')
            return
          }
        } catch (backendError) {
          console.warn('Backend not available, using email-based role assignment:', backendError)
        }
        
        // Final fallback: use email-based role assignment
        const email = u.email?.toLowerCase() || ''
        console.log('Using email-based role assignment for:', email)
        if (email.includes('datalead') || email.includes('data-lead')) {
          setRole('dataTeamLead')
        } else if (email.includes('lead') || email.includes('manager') || email.includes('admin')) {
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

  if (role === 'dataTeamLead') {
    return <Navigate to="/data-team-lead" replace />
  } else if (role === 'teamLead') {
    return <Navigate to="/team-lead" replace />
  } else {
    return <Navigate to="/data-team" replace />
  }
}
