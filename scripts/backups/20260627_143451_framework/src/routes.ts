import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Auth Layout wrapper
  layout("layouts/AuthLayout.tsx", [
    route("login", "pages/LoginPage.tsx"),
    route("register", "pages/RegisterPage.tsx"),
  ]),

  // Main Layout wrapper
  layout("layouts/MainLayout.tsx", [
    index("pages/DashboardRedirect.tsx"),
    route("dashboard", "pages/DashboardPage.tsx"),
    route("settings", "pages/SettingsPage.tsx"),
  ]),
] satisfies RouteConfig;
