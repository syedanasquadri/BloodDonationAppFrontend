import { apiClient } from "@/api/client";
import type { BloodGroup } from "@/constants/bloodGroups";
import { getAccessToken } from "@/lib/token-storage";

export type UserProfile = {
  id: number;
  name: string;
  bloodGroup: BloodGroup;
  phone: string;
  address: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserProfileInput = {
  name?: string;
  bloodGroup?: BloodGroup;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type UpdateUserProfileResponse = Pick<
  UserProfile,
  | "id"
  | "name"
  | "bloodGroup"
  | "address"
  | "city"
  | "state"
  | "latitude"
  | "longitude"
  | "createdAt"
  | "updatedAt"
>;

const getAuthenticatedUserId = async (): Promise<number> => {
  const token = await getAccessToken();
  const payload = token?.split(".")[1];

  if (!payload) {
    throw new Error("Your session is unavailable. Please sign in again.");
  }

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const claims: { sub?: unknown } = JSON.parse(atob(paddedBase64));

    if (typeof claims.sub !== "number" || !Number.isSafeInteger(claims.sub)) {
      throw new Error("The session does not contain a valid user ID.");
    }

    return claims.sub;
  } catch {
    throw new Error("Unable to read the user profile from this session.");
  }
};

export const getCurrentUserProfile = async (
  signal?: AbortSignal,
): Promise<UserProfile> => {
  const userId = await getAuthenticatedUserId();
  const response = await apiClient.get<UserProfile>(`/api/users/${userId}`, {
    signal,
  });

  return response.data;
};

export const updateUserProfile = async (
  userId: number,
  input: UpdateUserProfileInput,
): Promise<UpdateUserProfileResponse> => {
  const response = await apiClient.put<UpdateUserProfileResponse>(
    `/api/users/${userId}`,
    input,
  );

  return response.data;
};
