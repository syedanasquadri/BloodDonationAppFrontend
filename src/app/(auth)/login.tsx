
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { sendOtp } from "@/api/auth";

export default function LoginScreen() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    const cleanedPhone = phone.trim();

    // Validate Indian mobile number
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setError("");

    try {
      setLoading(true);

      const fullPhone = `+91${cleanedPhone}`;

      // Call backend to generate OTP
      await sendOtp(fullPhone);

      // Navigate to OTP verification
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { phone: fullPhone },
      });
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-[#FAF8F5] px-6">
      {/* Branding */}
      <Text className="text-4xl font-bold text-[#B42335]">
        DUA
      </Text>

      <Text className="mt-2 text-sm text-gray-500">
        Digital Unity for All
      </Text>

      {/* Heading */}
      <Text className="mt-12 text-3xl font-bold text-gray-900">
        Every drop brings us closer.
      </Text>

      <Text className="mt-3 text-base text-gray-500">
        Enter your mobile number to connect with the community.
      </Text>

      {/* Phone input */}
      <Text className="mb-2 mt-8 font-semibold text-gray-800">
        Mobile Number
      </Text>

      <View
        className={`flex-row items-center rounded-xl border bg-white px-4 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <Text className="mr-3 text-base font-semibold">
          +91
        </Text>

        <TextInput
          className="flex-1 py-4 text-base text-gray-900"
          placeholder="Enter 10-digit number"
          keyboardType="phone-pad"
          maxLength={10}
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            setError("");
          }}
          editable={!loading}
        />
      </View>

      {/* Inline error message */}
      {error ? (
        <Text className="mt-2 text-sm text-red-600">
          {error}
        </Text>
      ) : null}

      {/* Continue button */}
      <TouchableOpacity
        onPress={handleContinue}
        disabled={loading}
        className={`mt-6 items-center rounded-xl bg-[#B42335] py-4 ${
          loading ? "opacity-70" : ""
        }`}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="font-bold text-white">
            Continue
          </Text>
        )}
      </TouchableOpacity>

      {/* Footer */}
      <Text className="mt-6 text-center text-xs text-gray-500">
        Your number helps us securely connect you with the community.
      </Text>
    </View>
  );
}
