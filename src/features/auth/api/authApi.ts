import { apiClient } from "@/shared/lib/apiClient";
import type { ApiResponse } from "@/shared/types/api";
import type { LoginCredentials, RegisterCredentials, User } from "../types/auth.types";

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<ApiResponse<{ user: User; token: string }>>("/auth/login", credentials),

  register: (credentials: RegisterCredentials) =>
    apiClient.post<ApiResponse<{ user: User; token: string }>>("/auth/register", credentials),

  getProfile: () => apiClient.get<ApiResponse<User>>("/auth/me"),

  logout: () => apiClient.post<ApiResponse<null>>("/auth/logout"),
};
