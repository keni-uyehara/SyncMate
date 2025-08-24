// src/components/RoleRoute.tsx
import * as React from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

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
    let alive = true;

    const check = async () => {
      try {
        // 1) Try session cookie
        let res = await fetch(`${API_BASE}/me`, { credentials: "include" });

        // 2) Fallback to bearer token if cookie missing/invalid
        if (!res.ok) {
          const u = auth.currentUser;
          const token = u ? await u.getIdToken() : null;
          if (token) {
            res = await fetch(`${API_BASE}/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }

        if (!alive) return;

        if (!res.ok) {
          setAllowed(false);
        } else {
          const me = await res.json();
          setAllowed(me?.role === role);
        }
      } catch {
        if (!alive) return;
        setAllowed(false);
      } finally {
        if (!alive) return;
        setReady(true);
      }
    };

    // Wait for Firebase to be ready so bearer fallback is possible
    const unsub = onAuthStateChanged(auth, () => check());

    return () => {
      alive = false;
      unsub();
    };
  }, [role]);

  if (!ready) return <div style={{ padding: 24 }}>Checking access…</div>;
  if (!allowed) return <Navigate to="/not-authorized" replace />;
  return children;
}
