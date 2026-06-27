import type { ReactNode } from "react";
import { AuthContext } from "@/shared/context/AuthContext";
import { useAuthProvider } from "../../hooks/useAuthProvider";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth feature provider — wraps the app with authentication context.
 *
 * This component is intentionally thin: all state management lives in
 * useAuthProvider(), making the logic independently testable. The provider
 * simply bridges the hook output to React context.
 *
 * Exported from the feature's public index so root-level code (AppProviders)
 * can compose it without reaching into feature internals.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
