import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { verifyOtp } from "@/api/auth";
import { saveAuthTokens, saveSignupToken } from "@/lib/token-storage";
import { useAuth } from "@/context/AuthContext";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    if (!phone) {
      setError("Phone number is missing. Please login again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await verifyOtp(phone, otp);

      if (result.accountExists) {
        await saveAuthTokens(result.accessToken, result.refreshToken);
        await login();
        router.replace("/home");
      } else {
        await saveSignupToken(result.signupToken);

        router.replace("/(auth)/complete-profile");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "OTP verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-[#FAF8F5] px-6">
      <Text className="text-4xl font-bold text-[#B42335]">DUA</Text>

      <Text className="mt-2 text-sm text-gray-500">Digital Unity for All</Text>

      <Text className="mt-12 text-3xl font-bold text-gray-900">
        Verify your number
      </Text>

      <Text className="mt-3 text-base text-gray-500">
        Enter the 6-digit OTP sent to {phone}.
      </Text>

      <Text className="mb-2 mt-8 font-semibold text-gray-800">Enter OTP</Text>

      <TextInput
        className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-center text-2xl tracking-[10px] text-gray-900"
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={(value) => {
          setOtp(value.replace(/\D/g, ""));
          setError("");
        }}
        editable={!loading}
      />

      {error ? (
        <Text className="mt-2 text-sm text-red-600">{error}</Text>
      ) : null}

      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading}
        className="mt-6 items-center rounded-xl bg-[#B42335] py-4"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="font-bold text-white">Verify OTP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        disabled={loading}
        className="mt-5 items-center"
      >
        <Text className="font-semibold text-[#B42335]">
          Change phone number
        </Text>
      </TouchableOpacity>
    </View>
  );
}
