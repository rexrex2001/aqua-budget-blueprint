
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

// Component to protect routes
const RouteGuard = ({ children, requireAuth = false }: RouteGuardProps) => {
  const { user, loading } = useAuth();
  
  // If still loading, show nothing or a loading spinner
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // If requireAuth is true but no user, redirect to auth
  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  // If requireAuth is false and we have a user (login/register pages), redirect to home
  if (!requireAuth && user && window.location.pathname === "/auth") {
    return <Navigate to="/" replace />;
  }
  
  // Otherwise render the children
  return <>{children}</>;
};

export default RouteGuard;
