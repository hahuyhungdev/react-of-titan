import { createBrowserRouter, Navigate } from "react-router";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { DashboardPage } from "@/pages/dashboard";
import { SettingsPage } from "@/pages/settings";
import { ProfilePage } from "@/pages/profile";
import { NotificationsPage } from "@/pages/notifications";
import { TasksPage } from "@/pages/tasks";
import { AnnouncementsPage } from "@/pages/announcements";
import { SupportPage } from "@/pages/support";
import { ProtectedRoute, PublicRoute } from "@/shared/components/routing";

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
          { path: "/profile", element: <ProfilePage /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/tasks", element: <TasksPage /> },
          { path: "/announcements", element: <AnnouncementsPage /> },
          { path: "/support", element: <SupportPage /> },
        ],
      },
    ],
  },
]);
