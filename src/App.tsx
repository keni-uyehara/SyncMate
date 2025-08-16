import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { UserAuthProvider } from "./context/userAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";      // ⬅️ make sure this path is right
import RoleRoute from "./components/RoleRoute";                // ⬅️ create from earlier snippet
import Login from "./pages/Login";
import TeamLeadPortal from "./components/team-lead-portal";
import DataTeamPortal from "./components/data-team-portal";
import PortalSelector from "./components/portal-selector";
import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    // Load once to ensure env is valid (no .js extension for Vite TS)
    import("./firebaseConfig").catch((error) => {
      console.error("Firebase configuration error:", error);
      setFirebaseError(error instanceof Error ? error.message : "Firebase configuration error");
    });
  }, []);

  if (firebaseError) {
    return (
      <div style={{ padding: 40, maxWidth: 800, margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
        <h1 style={{ color: "red", marginBottom: 20 }}>Firebase Configuration Error</h1>
        <p style={{ marginBottom: 20 }}>Your Firebase configuration is missing or invalid. Please follow these steps:</p>
        <ol style={{ marginBottom: 20, lineHeight: 1.6 }}>
          <li>Create a <code>.env</code> file in your project root</li>
          <li>Add your Firebase configuration variables:</li>
        </ol>
        <pre style={{ backgroundColor: "#f5f5f5", padding: 15, borderRadius: 5, overflow: "auto" }}>
{`VITE_APIKEY=your-api-key-here
VITE_AUTHDOMAIN=your-project-id.firebaseapp.com
VITE_PROJECTID=your-project-id
VITE_STORAGEBUCKET=your-project-id.appspot.com
VITE_MESSAGESENDERID=your-sender-id
VITE_APPID=your-app-id`}
        </pre>
        <p style={{ marginTop: 20 }}>Get these values from Firebase Console → Project Settings → Your apps</p>
        <details style={{ marginTop: 20 }}>
          <summary>Error Details</summary>
          <pre style={{ color: "red", marginTop: 10 }}>{firebaseError}</pre>
        </details>
      </div>
    );
  }

  return (
    <UserAuthProvider>
      <Router>
        <div className="App" style={{ minHeight: "100vh", width: "100vw" }}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected: anyone logged in */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PortalSelector />
                </ProtectedRoute>
              }
            />

            {/* Role-protected */}
            <Route
              path="/team-lead-portal"
              element={
                <ProtectedRoute>
                  <RoleRoute role="teamLead">
                    <TeamLeadPortal />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-team-portal"
              element={
                <ProtectedRoute>
                  <RoleRoute role="dataTeam">
                    <DataTeamPortal />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Convenience redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Demo/sample routes (wrap if they should be protected) */}
            <Route
              path="/data team/homepage"
              element={
                <ProtectedRoute>
                  <RoleRoute role="dataTeam">
                    <div style={{ padding: 20 }}>Data Team Homepage</div>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/team lead/homepage"
              element={
                <ProtectedRoute>
                  <RoleRoute role="teamLead">
                    <div style={{ padding: 20 }}>Team Lead Homepage</div>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div style={{ padding: 20 }}>Profile Page</div>
                </ProtectedRoute>
              }
            />

            {/* Not authorized page */}
            <Route path="/not-authorized" element={<div style={{ padding: 24 }}>🚫 Not Authorized</div>} />
          </Routes>
        </div>
      </Router>
    </UserAuthProvider>
  );
}

export default App;
