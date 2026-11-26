import { apiClient } from "@/api/client";
import type { BloodGroup } from "@/constants/bloodGroups";

export type DonationRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED";

export type CounterpartyUser = {
  id: number;
  name: string;
  bloodGroup: BloodGroup;
  city: string | null;
  state: string | null;
  phone?: string | null;
};

export type ReceivedDonationRequest = {
  id: number;
  requesterId: number;
  donorId: number;
  bloodGroup: BloodGroup;
  status: DonationRequestStatus;
  createdAt: string;
  updatedAt: string;
  requester?: CounterpartyUser | null;
};

export type SentDonationRequest = {
  id: number;
  requesterId: number;
  donorId: number;
  bloodGroup: BloodGroup;
  status: DonationRequestStatus;
  createdAt: string;
  updatedAt: string;
  donor?: CounterpartyUser | null;
};

export type DonationRequestRecord = SentDonationRequest;

export type DonationRequestDecision = "ACCEPTED" | "REJECTED";

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

export const getReceivedDonationRequests = async (
  signal?: AbortSignal,
): Promise<ReceivedDonationRequest[]> => {
  const response = await apiClient.get<ReceivedDonationRequest[]>(
    "/api/donation-requests/received",
    { signal },
  );

  return response.data;
};

export const getSentDonationRequests = async (
  signal?: AbortSignal,
): Promise<DonationRequestRecord[]> => {
  const response = await apiClient.get<DonationRequestRecord[]>(
    "/api/donation-requests/sent",
    { signal },
  );

  return response.data;
};

export const updateDonationRequestStatus = async (
  id: number,
  status: DonationRequestDecision,
): Promise<ReceivedDonationRequest> => {
  const response = await apiClient.patch<ReceivedDonationRequest>(
    `/api/donation-requests/${id}/status`,
    { status },
  );

  return response.data;
};
