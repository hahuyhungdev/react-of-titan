import { createBrowserRouter, Navigate } from "react-router";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { SettingsPage } from "@/pages/SettingsPage";

/**
 * Central route aggregator.
 *
 * Pages live in src/pages/ and import components/hooks from features.
 * Features never import pages — the dependency flows one way:
 *
 *   shared → features → pages → app/router
 *
 * When adding a new feature:
 *   1. Create components/hooks/api/types in the feature folder
 *   2. Create a page in src/pages/ that composes the feature
 *   3. Register the route here
 */
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
