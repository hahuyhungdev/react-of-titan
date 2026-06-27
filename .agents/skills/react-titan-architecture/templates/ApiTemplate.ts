import { apiClient } from "@/shared/lib/apiClient";

export interface FeatureResponse {
  id: string;
  name: string;
}

export const featureApi = {
  getById: async (id: string): Promise<FeatureResponse> => {
    return apiClient.get<FeatureResponse>(`/feature/${id}`);
  },

  create: async (data: Omit<FeatureResponse, "id">): Promise<FeatureResponse> => {
    return apiClient.post<FeatureResponse>("/feature", data);
  },
};

export default featureApi;
