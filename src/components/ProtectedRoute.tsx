// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "../context/userAuthContext";
import { auth } from "../firebaseConfig";

type Props = { children: React.ReactNode };

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, loading } = useUserAuth() as { user: any; loading?: boolean };

  if (loading) {
    return <div className="min-h-screen grid place-items-center">Checking session…</div>;
  }

  // Fallback in case context hasn't set user yet but Firebase has one
  if (!user && !auth.currentUser) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
