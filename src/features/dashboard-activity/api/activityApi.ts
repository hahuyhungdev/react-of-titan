import { apiClient } from "@/shared/lib/apiClient";
import type { ApiResponse } from "@/shared/types/api";
import type { Activity } from "../types/activity.types";

export const activityApi = {
  getRecent: () => apiClient.get<ApiResponse<Activity[]>>("/dashboard/activity"),
};
