import { Navigate } from "react-router";

export default function DashboardRedirect() {
  return <Navigate to="/dashboard" replace />;
}
