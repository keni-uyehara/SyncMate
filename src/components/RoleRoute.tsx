import React from "react";
import { Navigate } from "react-router-dom";

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
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/me`, {
          credentials: "include",
        });
        if (!res.ok) {
          setReady(true);
          return;
        }
        const me = await res.json();
        setAllowed(me.role === role);
      } finally {
        setReady(true);
      }
    })();
  }, [role]);

  if (!ready) return <div style={{ padding: 24 }}>Checking access…</div>;
  if (!allowed) return <Navigate to="/not-authorized" replace />;
  return children;
}
