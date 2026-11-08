import * as SecureStore from "expo-secure-store";
import { persistRotatedTokenPair } from "@/context/session-coordinator";

export const saveAuthTokens = async (
  accessToken: string,
  refreshToken: string,
) => {
  if (!accessToken || !refreshToken) {
    throw new Error("Both authentication tokens are required.");
  }

  const [previousAccessToken, previousRefreshToken] = await Promise.all([
    SecureStore.getItemAsync("accessToken"),
    SecureStore.getItemAsync("refreshToken"),
  ]);

  try {
    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);

    const [storedAccessToken, storedRefreshToken] = await Promise.all([
      SecureStore.getItemAsync("accessToken"),
      SecureStore.getItemAsync("refreshToken"),
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
        ? SecureStore.setItemAsync("accessToken", previousAccessToken)
        : SecureStore.deleteItemAsync("accessToken"),
      previousRefreshToken
        ? SecureStore.setItemAsync("refreshToken", previousRefreshToken)
        : SecureStore.deleteItemAsync("refreshToken"),
    ]);
    throw error;
  }
};

export const saveSignupToken = async (signupToken: string) => {
  await SecureStore.setItemAsync("signupToken", signupToken);
};

export const getAccessToken = async () => {
  return SecureStore.getItemAsync("accessToken");
};

export const getRefreshToken = async () => {
  return SecureStore.getItemAsync("refreshToken");
};

export const getSignupToken = async () => {
  return SecureStore.getItemAsync("signupToken");
};

export const clearTokens = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync("accessToken"),
    SecureStore.deleteItemAsync("refreshToken"),
    SecureStore.deleteItemAsync("signupToken"),
  ]);
};

export const clearAuthTokens = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync("accessToken"),
    SecureStore.deleteItemAsync("refreshToken"),
  ]);
};

export const clearSignupToken = async () => {
  await SecureStore.deleteItemAsync("signupToken");
};

export const saveRotatedAuthTokens = async (
  accessToken: string,
  refreshToken: string,
) => {
  await persistRotatedTokenPair(
    {
      setAccessToken: (token) =>
        SecureStore.setItemAsync("accessToken", token),
      setRefreshToken: (token) =>
        SecureStore.setItemAsync("refreshToken", token),
      getAccessToken,
      getRefreshToken,
      clearAuthTokens,
    },
    accessToken,
    refreshToken,
  );
};