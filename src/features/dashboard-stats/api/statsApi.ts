import { apiClient } from "@/shared/lib/apiClient";
import type { ApiResponse } from "@/shared/types/api";
import type { DashboardStats } from "../types/stats.types";

export const statsApi = {
  getStats: () => apiClient.get<ApiResponse<DashboardStats>>("/dashboard/stats"),
};
