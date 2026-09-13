import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location, message: "Please log in to access your dashboard." }} replace />;
  }

  if (user.role === "doctor" && location.pathname === "/dashboard") {
    return <Navigate to="/doctor-portal" replace />;
  }

  return <>{children}</>;
}
