import { type ReactNode } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/shared/context/AuthContext";
import { Spinner } from "@/shared/components/ui/Spinner";
import { ROUTES } from "@/shared/constants";

interface PublicRouteProps {
  children?: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="page-loading page-loading-centered">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
