// app/router.tsx — route config. Lazy-load pages để code-split theo route.
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => {
      const { LoginPage } = await import("@/pages/login/LoginPage");
      return { Component: LoginPage };
    },
  },
  {
    path: "/dashboard",
    lazy: async () => {
      const { DashboardPage } = await import("@/pages/dashboard/DashboardPage");
      return { Component: DashboardPage };
    },
  },
]);
