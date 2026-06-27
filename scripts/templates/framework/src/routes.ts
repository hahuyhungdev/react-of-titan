import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Auth Layout wrapper
  layout("layouts/AuthLayout.tsx", [
    route("login", "pages/Login/LoginPage.tsx"),
    route("register", "pages/Register/RegisterPage.tsx"),
  ]),

  // Main Layout wrapper
  layout("layouts/MainLayout.tsx", [
    index("pages/DashboardRedirect.tsx"),
    route("dashboard", "pages/Dashboard/DashboardPage.tsx"),
    route("settings", "pages/Settings/SettingsPage.tsx"),
  ]),
] satisfies RouteConfig;
