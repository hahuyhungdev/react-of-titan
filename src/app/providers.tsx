import type { ReactNode } from "react";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Compose all context providers here.
 * Add providers as your app grows (theme, query client, auth state, etc.)
 *
 * Example with a theme provider:
 *   <ThemeProvider>
 *     <QueryClientProvider client={queryClient}>
 *       {children}
 *     </QueryClientProvider>
 *   </ThemeProvider>
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <>{children}</>;
}
