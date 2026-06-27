import { type ReactNode } from "react";
import { AuthProvider } from "@/features/auth";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Root providers composition.
 *
 * Each feature provider (e.g. AuthProvider) is exported from its feature index
 * and composed here at the app root in the correct nesting order. This preserves
 * clear dependency layers (root can import features, but providers.tsx doesn't
 * bypass feature boundaries anymore).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default AppProviders;
