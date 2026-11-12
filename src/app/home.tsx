import { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import {
  getAccessToken,
  getRefreshToken,
} from "@/lib/token-storage";

export default function HomeScreen() {
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("DUA HOME SCREEN RENDERED");

    const checkTokens = async () => {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      console.log("Authenticated:", isAuthenticated);
      console.log("Access token exists:", !!accessToken);
      console.log("Refresh token exists:", !!refreshToken);
    };

    checkTokens();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 items-center justify-center bg-[#FAF8F5]">
      <Text className="text-3xl font-bold text-[#B42335]">
        DUA Home
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/find-blood")}
        className="mt-8 w-4/5 rounded-xl bg-[#B42335] px-8 py-4"
      >
        <Text className="text-center font-bold text-white">Find Blood</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleLogout}
        className="mt-8 rounded-xl bg-[#B42335] px-8 py-4"
      >
        <Text className="font-bold text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
