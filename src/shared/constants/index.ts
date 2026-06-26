export const APP_NAME = "MyApp";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

/** Routes used by the router and navigation components. */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  SETTINGS: "/settings",
} as const;

/** Storage keys for localStorage. */
export const STORAGE_KEYS = {
  TOKEN: "auth_token",
  THEME: "theme",
} as const;
