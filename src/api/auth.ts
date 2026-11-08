import { apiClient } from "./client";

interface SendOtpResponse {
  message: string;
}

export const sendOtp = async (
  phone: string
): Promise<SendOtpResponse> => {
  const response = await apiClient.post<SendOtpResponse>(
    "/api/auth/send-otp",
    { phone }
  );

  return response.data;
};


export interface ExistingUserResponse {
  message: string;
  accountExists: true;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    phone: string;
    bloodGroup: string;
  };
}

export interface NewUserResponse {
  message: string;
  accountExists: false;
  signupToken: string;
}

export type VerifyOtpResponse =
  | ExistingUserResponse
  | NewUserResponse;

export const verifyOtp = async (
  phone: string,
  otp: string
): Promise<VerifyOtpResponse> => {
  const response = await apiClient.post<VerifyOtpResponse>(
    "/api/auth/verify-otp",
    {
      phone,
      otp,
    }
  );

  return response.data;
};

export interface CompleteSignupPayload {
  name: string;
  bloodGroup: string;
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

export interface CompleteSignupResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    phone: string;
    bloodGroup: string;
  };
}

export const completeSignup = async (
  signupToken: string,
  payload: CompleteSignupPayload
): Promise<CompleteSignupResponse> => {
  const response = await apiClient.post<CompleteSignupResponse>(
    "/api/auth/signup",
    payload,
    {
      headers: {
        Authorization: `Bearer ${signupToken}`,
      },
    }
  );

  return response.data;
};

export const logoutSession = async (refreshToken: string): Promise<void> => {
  await apiClient.post("/api/auth/logout", { refreshToken });
};
