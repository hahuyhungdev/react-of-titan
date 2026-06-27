import { apiClient } from "@/shared/lib/apiClient";
import type { ApiResponse } from "@/shared/types/api";
import type { UserProfile, UpdateProfilePayload } from "../types/profile.types";

export const profileApi = {
  getProfile: () => apiClient.get<ApiResponse<UserProfile>>("/profile"),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.put<ApiResponse<UserProfile>>("/profile", payload),
};
