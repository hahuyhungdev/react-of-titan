import { useState, useEffect, useCallback } from "react";
import type { AuthContextType } from "@/shared/context/AuthContext";
import type { User, LoginCredentials, RegisterCredentials } from "@/shared/types/auth.types";
import { STORAGE_KEYS } from "@/shared/constants";
import { isNetworkError } from "@/shared/utils/isNetworkError";
import { authApi } from "../api/authApi";

/**
 * Core auth state management hook — owns login, register, logout, and session
 * initialisation logic. Returns a value conforming to AuthContextType so it
 * can be plugged directly into the AuthContext provider.
 *
 * This hook lives inside the auth feature because it depends on authApi
 * (a feature-internal module). By keeping it here we avoid the dependency-
 * flow violation that would occur if root-level code imported authApi directly.
 *
 * **Why a hook instead of putting everything in the provider component?**
 * Separating state logic into a hook makes it independently testable and
 * keeps the provider component a thin wrapper.
 */
export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Session initialisation ──────────────────────────────────────────
  // On mount, check for a stored token and fetch the current user profile.
  // Falls back to a mock user when the API server is unreachable (dev mode).
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
        if (isNetworkError(err)) {
          // API server unreachable — use mock session for local development
          console.warn("API server not available, using mock user session", err);
          if (!cancelled) {
            setUser({
              id: "mock-user-id",
              email: "user@titan.com",
              name: "Titan User",
            });
          }
        } else {
          // Backend rejected the token (invalid, expired, or malformed)
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

  // ── Cross-tab synchronisation ───────────────────────────────────────
  // Listen for localStorage changes in other tabs/windows so auth state
  // stays consistent across the entire browser session.
  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === STORAGE_KEYS.TOKEN) {
        if (!event.newValue) {
          // Token removed in another tab — sign out locally
          setUser(null);
        } else {
          // Token updated in another tab — reload to re-initialise
          window.location.reload();
        }
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(credentials);
      setUser(response.data.user);
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn("API server not available, performing mock login");
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
      if (isNetworkError(err)) {
        console.warn("API server not available, performing mock registration");
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
      // Ignore network errors on logout — user intent is to sign out
    } finally {
      setUser(null);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
