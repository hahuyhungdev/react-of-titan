import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Auth Layout wrapper
  layout("layouts/AuthLayout.tsx", [
    route("login", "pages/login/index.tsx"),
    route("register", "pages/register/index.tsx"),
  ]),

  // Main Layout wrapper
  layout("layouts/MainLayout.tsx", [
    index("pages/DashboardRedirect.tsx"),
    route("dashboard", "pages/dashboard/index.tsx"),
    route("settings", "pages/settings/index.tsx"),
    route("profile", "pages/profile/index.tsx"),
    route("notifications", "pages/notifications/index.tsx"),
    route("tasks", "pages/tasks/index.tsx"),
    route("announcements", "pages/announcements/index.tsx"),
    route("support", "pages/support/index.tsx"),
  ]),
] satisfies RouteConfig;
