import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function HomeScreen() {
  const { logout } = useAuth();
  const router = useRouter();

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
        onPress={handleLogout}
        className="mt-8 rounded-xl bg-[#B42335] px-8 py-4"
      >
        <Text className="font-bold text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}