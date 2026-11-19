import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { persistRotatedTokenPair } from "@/context/session-coordinator";

const isWeb = Platform.OS === "web";
const memoryStore = new Map<string, string>();

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch {
        // Fallback to in-memory store if localStorage is blocked
      }
      return memoryStore.get(key) ?? null;
    }
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
          return;
        }
      } catch {
        // Fallback to in-memory store if localStorage is blocked
      }
      memoryStore.set(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },

  async deleteItem(key: string): Promise<void> {
    if (isWeb) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
          return;
        }
      } catch {
        // Fallback to in-memory store if localStorage is blocked
      }
      memoryStore.delete(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const saveAuthTokens = async (
  accessToken: string,
  refreshToken: string,
) => {
  if (!accessToken || !refreshToken) {
    throw new Error("Both authentication tokens are required.");
  }

  const [previousAccessToken, previousRefreshToken] = await Promise.all([
    storage.getItem("accessToken"),
    storage.getItem("refreshToken"),
  ]);

  try {
    await storage.setItem("accessToken", accessToken);
    await storage.setItem("refreshToken", refreshToken);

    const [storedAccessToken, storedRefreshToken] = await Promise.all([
      storage.getItem("accessToken"),
      storage.getItem("refreshToken"),
    ]);

    if (
      storedAccessToken !== accessToken ||
      storedRefreshToken !== refreshToken
    ) {
      throw new Error("Authentication tokens could not be verified in storage.");
    }
  } catch (error) {
    await Promise.all([
      previousAccessToken
        ? storage.setItem("accessToken", previousAccessToken)
        : storage.deleteItem("accessToken"),
      previousRefreshToken
        ? storage.setItem("refreshToken", previousRefreshToken)
        : storage.deleteItem("refreshToken"),
    ]);
    throw error;
  }
};

export const saveSignupToken = async (signupToken: string) => {
  await storage.setItem("signupToken", signupToken);
};

export const getAccessToken = async () => {
  return storage.getItem("accessToken");
};

export const getRefreshToken = async () => {
  return storage.getItem("refreshToken");
};

export const getSignupToken = async () => {
  return storage.getItem("signupToken");
};

export const clearTokens = async () => {
  await Promise.all([
    storage.deleteItem("accessToken"),
    storage.deleteItem("refreshToken"),
    storage.deleteItem("signupToken"),
  ]);
};

export const clearAuthTokens = async () => {
  await Promise.all([
    storage.deleteItem("accessToken"),
    storage.deleteItem("refreshToken"),
  ]);
};

export const clearSignupToken = async () => {
  await storage.deleteItem("signupToken");
};

export const saveRotatedAuthTokens = async (
  accessToken: string,
  refreshToken: string,
) => {
  await persistRotatedTokenPair(
    {
      setAccessToken: (token) => storage.setItem("accessToken", token),
      setRefreshToken: (token) => storage.setItem("refreshToken", token),
      getAccessToken,
      getRefreshToken,
      clearAuthTokens,
    },
    accessToken,
    refreshToken,
  );
};
