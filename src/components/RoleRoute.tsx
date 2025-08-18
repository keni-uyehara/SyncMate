import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebaseConfig";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5173";

// Fetches from /me to get the role
export default function RoleRoute({
  role,
  children,
}: {
  role: "dataTeam" | "teamLead";
  children: JSX.Element;
}) {
  const [ready, setReady] = React.useState(false);
  const [allowed, setAllowed] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        // Try to get role from Firebase custom claims first
        const currentUser = auth.currentUser;
        if (currentUser) {
          const tokenResult = await currentUser.getIdTokenResult(true);
          const claimRole = tokenResult.claims.role as ("dataTeam"|"teamLead"|undefined);
          
          if (claimRole) {
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
            setAllowed(me.role === role);
            setReady(true);
            return;
          }
        } catch (backendError) {
          console.warn('Backend not available, using email-based role check:', backendError);
        }
        
        // Final fallback: use email-based role assignment
        if (currentUser) {
          const email = currentUser.email?.toLowerCase() || '';
          let userRole: "dataTeam" | "teamLead";
          
          if (email.includes('lead') || email.includes('manager') || email.includes('admin')) {
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
