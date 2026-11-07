import * as SecureStore from "expo-secure-store";

export const saveAuthTokens = async (
  accessToken: string,
  refreshToken: string,
) => {
  await SecureStore.setItemAsync("accessToken", accessToken);
  await SecureStore.setItemAsync("refreshToken", refreshToken);
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
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
  await SecureStore.deleteItemAsync("signupToken");
};

export const clearAuthTokens = async () => {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
};
