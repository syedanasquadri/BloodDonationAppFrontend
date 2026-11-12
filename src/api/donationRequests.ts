import { apiClient } from "@/api/client";

export type CreateDonationRequestInput = {
  donorId: number;
  bloodGroup: string;
};

export const createDonationRequest = async (
  request: CreateDonationRequestInput
) => {
  const response = await apiClient.post(
    "/api/donation-requests",
    request
  );

  return response.data;
};