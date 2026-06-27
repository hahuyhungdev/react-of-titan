import { type ReactNode } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/shared/context/AuthContext";
import { Spinner } from "@/shared/components/ui/Spinner";

interface ProtectedRouteProps {
  children?: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="page-loading"
        style={{ display: "grid", placeItems: "center", minHeight: "50vh" }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
