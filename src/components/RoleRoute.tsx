import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { supabase } from "../supabaseClient";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5173";

// Fetches from /me to get the role
export default function RoleRoute({
  role,
  children,
}: {
  role: "dataTeam" | "teamLead" | "dataTeamLead";
  children: JSX.Element;
}) {
  const [ready, setReady] = React.useState(false);
  const [allowed, setAllowed] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        // First, try to get role from Supabase users table
        const currentUser = auth.currentUser;
        if (currentUser?.email) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('email', currentUser.email)
            .single();

          if (!userError && userData?.role) {
            console.log('RoleRoute: Found user role in Supabase:', userData.role);
            setAllowed(userData.role === role);
            setReady(true);
            return;
          } else {
            console.log('RoleRoute: No user found in Supabase or error:', userError);
          }
        }

        // Fallback: try to get role from Firebase custom claims
        if (currentUser) {
          const tokenResult = await currentUser.getIdTokenResult(true);
          const claimRole = tokenResult.claims.role as ("dataTeam"|"teamLead"|"dataTeamLead"|undefined);
          
          if (claimRole) {
            console.log('RoleRoute: Found role in Firebase claims:', claimRole);
            setAllowed(claimRole === role);
            setReady(true);
            return;
          }
        }
        
        // Fallback: try backend API
        try {
          const res = await fetch(`${API_BASE}/me`, {
            credentials: "include",
          });
          if (res.ok) {
            const me = await res.json();
            console.log('RoleRoute: Found role in backend API:', me.role);
            setAllowed(me.role === role);
            setReady(true);
            return;
          }
        } catch (backendError) {
          console.warn('RoleRoute: Backend not available, using email-based role check:', backendError);
        }
        
        // Final fallback: use email-based role assignment
        if (currentUser) {
          const email = currentUser.email?.toLowerCase() || '';
          console.log('RoleRoute: Using email-based role assignment for:', email);
          let userRole: "dataTeam" | "teamLead" | "dataTeamLead";
          
          if (email.includes('datalead') || email.includes('data-lead')) {
            userRole = 'dataTeamLead';
          } else if (email.includes('lead') || email.includes('manager') || email.includes('admin')) {
            userRole = 'teamLead';
          } else {
            userRole = 'dataTeam'; // default role
          }
          
          setAllowed(userRole === role);
        } else {
          setAllowed(false); // No user, not allowed
        }
        
      } catch (e) {
        console.error("RoleRoute error:", e);
        setAllowed(false);
      } finally {
        setReady(true);
      }
    })();
  }, [role]);

  if (!ready) return <div style={{ padding: 24 }}>Checking access…</div>;
  if (!allowed) return <Navigate to="/not-authorized" replace />;
  return children;
}
