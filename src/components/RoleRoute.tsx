import React from "react";
import { Navigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

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
        const res = await fetch(`${API_BASE}/me`, {
          credentials: "include",
        });
        if (!res.ok) {
          setReady(true);
          return;
        }
        const me = await res.json();
        setAllowed(me.role === role);
      } catch (e) {
        console.error("RoleRoute /me error:", e);
      } finally {
        setReady(true);
      }
    })();
  }, [role]);

  if (!ready) return <div style={{ padding: 24 }}>Checking access…</div>;
  if (!allowed) return <Navigate to="/not-authorized" replace />;
  return children;
}
