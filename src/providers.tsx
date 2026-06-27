import { type ReactNode, useState, useEffect, useCallback } from "react";
import { AuthContext } from "@/shared/context/AuthContext";
import type { User, LoginCredentials, RegisterCredentials } from "@/shared/types/auth.types";
import { authApi } from "@/features/auth";
import { STORAGE_KEYS } from "@/shared/constants";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize: check for token and fetch profile
  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getProfile();
        if (!cancelled) {
          setUser(response.data);
        }
      } catch (err: unknown) {
        // Distinguish network/server downtime from token validation errors
        const isNetworkError =
          err instanceof Error &&
          (err.message.includes("Failed to fetch") ||
            err.message.includes("Is the API server running") ||
            err.name === "TypeError");
        const looksLikeNetworkError =
          err &&
          typeof err === "object" &&
          "message" in err &&
          (String((err as { message: string }).message).includes("Failed to fetch") ||
            String((err as { message: string }).message).includes("Is the API server running"));

        if (isNetworkError || looksLikeNetworkError) {
          // Fallback for mock environment if no backend is running
          console.warn("API server not available, using mock user session", err);
          if (!cancelled) {
            setUser({
              id: "mock-user-id",
              email: "user@titan.com",
              name: "Titan User",
            });
          }
        } else {
          // Backend is running but rejected the token (invalid, expired, or malformed)
          console.error("Session initialization failed due to invalid/expired token:", err);
          if (!cancelled) {
            setUser(null);
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    initAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync authentication state across browser tabs/windows
  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === STORAGE_KEYS.TOKEN) {
        if (!event.newValue) {
          // Token deleted in another tab/window
          setUser(null);
        } else {
          // Token updated in another tab/window, reload to re-initialize
          window.location.reload();
        }
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(credentials);
      setUser(response.data.user);
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
    } catch (err: unknown) {
      // Fallback for mock/development environment if fetch fails
      const isNetworkError =
        err instanceof Error &&
        (err.message.includes("Failed to fetch") ||
          err.message.includes("Is the API server running"));
      const looksLikeNetworkError =
        err &&
        typeof err === "object" &&
        "message" in err &&
        (String((err as { message: string }).message).includes("Failed to fetch") ||
          String((err as { message: string }).message).includes("Is the API server running"));

      if (isNetworkError || looksLikeNetworkError) {
        console.warn("API server not available, performing mock login");
        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockUser: User = {
          id: "mock-user-id",
          email: credentials.email,
          name: credentials.email.split("@")[0] || "Titan User",
        };
        setUser(mockUser);
        localStorage.setItem(STORAGE_KEYS.TOKEN, "mock-jwt-token");
      } else {
        const message =
          err instanceof Error
            ? err.message
            : err && typeof err === "object" && "message" in err
              ? String((err as { message: string }).message)
              : "Login failed";
        setError(message);
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(credentials);
      setUser(response.data.user);
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
    } catch (err: unknown) {
      // Fallback for mock/development environment if fetch fails
      const isNetworkError =
        err instanceof Error &&
        (err.message.includes("Failed to fetch") ||
          err.message.includes("Is the API server running"));
      const looksLikeNetworkError =
        err &&
        typeof err === "object" &&
        "message" in err &&
        (String((err as { message: string }).message).includes("Failed to fetch") ||
          String((err as { message: string }).message).includes("Is the API server running"));

      if (isNetworkError || looksLikeNetworkError) {
        console.warn("API server not available, performing mock registration");
        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockUser: User = {
          id: "mock-user-id",
          email: credentials.email,
          name: credentials.name,
        };
        setUser(mockUser);
        localStorage.setItem(STORAGE_KEYS.TOKEN, "mock-jwt-token");
      } else {
        const message =
          err instanceof Error
            ? err.message
            : err && typeof err === "object" && "message" in err
              ? String((err as { message: string }).message)
              : "Registration failed";
        setError(message);
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
