import { DonorSearchResult, DonorFilters } from "@/types/donorTypes";
import { apiClient } from "@/api/client";

export const getDonors = async (
  filters: DonorFilters,
  signal?: AbortSignal,
): Promise<DonorSearchResult[]> => {
  const response = await apiClient.get("/api/users", {
    params: filters,
    signal,
  });

  return response.data;
};
