import { createBrowserRouter, Navigate } from "react-router";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginPage } from "@/pages/Login/LoginPage";
import { RegisterPage } from "@/pages/Register/RegisterPage";
import { DashboardPage } from "@/pages/Dashboard/DashboardPage";
import { SettingsPage } from "@/pages/Settings/SettingsPage";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute/ProtectedRoute";
import { PublicRoute } from "@/shared/components/PublicRoute/PublicRoute";

export const router = createBrowserRouter([
  // ── Auth routes (minimal layout, only for guests) ─────────
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ],
      },
    ],
  },

  // ── App routes (main layout, requires auth) ───────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
