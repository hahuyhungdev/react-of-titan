/** Auth feature constants — scoped to this feature only. */

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_TAKEN: "Email is already registered",
  WEAK_PASSWORD: "Password must be at least 8 characters",
  NETWORK_ERROR: "Network error. Please try again.",
} as const;

export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
} as const;

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  LOGOUT: "/",
} as const;
