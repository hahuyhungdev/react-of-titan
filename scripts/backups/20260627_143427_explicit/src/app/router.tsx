import { createBrowserRouter, Navigate } from "react-router";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { SettingsPage } from "@/pages/SettingsPage";

export const router = createBrowserRouter([
  // ── Auth routes (minimal layout) ──────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },

  // ── App routes (main layout with header/sidebar) ─────────
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
]);
