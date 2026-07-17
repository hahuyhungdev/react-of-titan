// app/router.tsx — route config. Lazy-load pages để code-split theo route.
import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { AuthLayout } from "./layouts/AuthLayout";

export const router = createBrowserRouter([
  // ── Auth routes (minimal layout) ──────────────────────────
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        lazy: async () => {
          const { LoginPage } = await import("@/pages/login/LoginPage");
          return { Component: LoginPage };
        },
      },
      {
        path: "/register",
        lazy: async () => {
          const { RegisterPage } = await import("@/pages/register/RegisterPage");
          return { Component: RegisterPage };
        },
      },
    ],
  },

  // ── App routes (main layout with header/sidebar) ─────────
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      {
        path: "/dashboard",
        lazy: async () => {
          const { DashboardPage } = await import("@/pages/dashboard/DashboardPage");
          return { Component: DashboardPage };
        },
      },
      {
        path: "/settings",
        lazy: async () => {
          const { SettingsPage } = await import("@/pages/settings/SettingsPage");
          return { Component: SettingsPage };
        },
      },
    ],
  },
]);
