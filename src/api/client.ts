import axios, { InternalAxiosRequestConfig } from "axios";
import { API_URL } from "./config";
import {
  getAccessToken,
  getRefreshToken,
  saveRotatedAuthTokens,
  clearAuthTokens,
} from "@/lib/token-storage";
import { notifyAuthInvalidated } from "@/context/auth-events";
import { sessionCoordinator } from "@/context/session-coordinator";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _sessionGeneration?: number;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

const isRequestSessionCurrent = (requestGeneration: number) =>
  sessionCoordinator.isGenerationCurrent(requestGeneration);

const invalidateLocalSession = async (preserveRefreshToken = false) => {
  sessionCoordinator.invalidateSession(preserveRefreshToken);

  try {
    await clearAuthTokens();
  } catch (error) {
    console.error("Unable to clear invalid authentication tokens.", error);
  } finally {
    notifyAuthInvalidated();
  }
};

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (config.url?.includes("/api/auth/")) {
    return config;
  }

  const retryConfig = config as RetryConfig;
  if (sessionCoordinator.isBlocked) {
    return Promise.reject(new Error("The authentication session is inactive."));
  }

  if (retryConfig._sessionGeneration === undefined) {
    retryConfig._sessionGeneration = sessionCoordinator.currentGeneration;
  } else if (
    retryConfig._sessionGeneration !== sessionCoordinator.currentGeneration
  ) {
    return Promise.reject(
      new Error("The authentication session ended before the request was sent."),
    );
  }

  const requestGeneration = retryConfig._sessionGeneration;
  const token = await getAccessToken();
  if (!sessionCoordinator.isGenerationCurrent(requestGeneration)) {
    return Promise.reject(
      new Error("The authentication session ended before the request was sent."),
    );
  }

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = "Bearer " + token;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/api/auth/")
    ) {
      return Promise.reject(error);
    }

    const requestGeneration =
      originalRequest._sessionGeneration ?? sessionCoordinator.currentGeneration;
    if (
      sessionCoordinator.isBlocked ||
      requestGeneration !== sessionCoordinator.currentGeneration
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const requestAuthorization = originalRequest.headers.Authorization;
      const failedAccessToken =
        typeof requestAuthorization === "string"
          ? requestAuthorization.replace(/^Bearer\s+/i, "")
          : null;
      const currentAccessToken = await getAccessToken();

      if (!isRequestSessionCurrent(requestGeneration)) {
        return Promise.reject(error);
      }

      if (currentAccessToken && currentAccessToken !== failedAccessToken) {
        originalRequest.headers.Authorization = "Bearer " + currentAccessToken;
        return apiClient(originalRequest);
      }

      const refreshToken = await getRefreshToken();
      if (!isRequestSessionCurrent(requestGeneration)) {
        return Promise.reject(error);
      }

      if (!refreshToken) {
        await invalidateLocalSession();
        throw new Error("Refresh token not found.");
      }

      const { accessToken } = await sessionCoordinator.runRefresh(async () => {
        const { data } = await refreshClient.post<RefreshResponse>(
          "/api/auth/refresh",
          { refreshToken },
        );

        try {
          if (
            typeof data.accessToken !== "string" ||
            !data.accessToken ||
            typeof data.refreshToken !== "string" ||
            !data.refreshToken
          ) {
            throw new Error("Refresh response did not contain both tokens.");
          }

          if (
            sessionCoordinator.isBlocked ||
            requestGeneration === sessionCoordinator.currentGeneration
          ) {
            sessionCoordinator.recordRotatedRefreshToken(data.refreshToken);
          }

          if ((await getRefreshToken()) !== refreshToken) {
            throw new Error("The session changed during token refresh.");
          }

          await saveRotatedAuthTokens(data.accessToken, data.refreshToken);

          return data;
        } catch (persistenceError) {
          if (
            isRequestSessionCurrent(requestGeneration) ||
            sessionCoordinator.isBlocked
          ) {
            await invalidateLocalSession(true);
          }

          throw persistenceError;
        }
      });

      if (!isRequestSessionCurrent(requestGeneration)) {
        return Promise.reject(
          new Error("The authentication session ended during token refresh."),
        );
      }

      originalRequest.headers.Authorization = "Bearer " + accessToken;
      return apiClient(originalRequest);
    } catch (refreshError) {
      if (
        axios.isAxiosError(refreshError) &&
        refreshError.response?.status === 401 &&
        isRequestSessionCurrent(requestGeneration)
      ) {
        await invalidateLocalSession();
      }

      return Promise.reject(refreshError);
    }
  },
);
