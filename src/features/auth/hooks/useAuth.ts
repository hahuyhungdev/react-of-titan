import { useState, useCallback } from "react";
import type { LoginCredentials, RegisterCredentials, User } from "../types/auth.types";
import { authApi } from "../api/authApi";
import { STORAGE_KEYS } from "@/shared/constants";

/**
 * Auth feature hook — manages login, register, logout, and auth state.
 * Scoped to the auth feature. Other features check `isAuthenticated` via context if needed.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(credentials);
      setUser(response.data.user);
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
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
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}
