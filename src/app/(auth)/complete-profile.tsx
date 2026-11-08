import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { completeSignup } from "@/api/auth";
import {
  getSignupToken,
  saveAuthTokens,
  clearSignupToken,
} from "@/lib/token-storage";
import { useAuth } from "@/context/AuthContext";

const BLOOD_GROUPS = [
  { label: "A+", value: "A_POSITIVE" },
  { label: "A-", value: "A_NEGATIVE" },
  { label: "B+", value: "B_POSITIVE" },
  { label: "B-", value: "B_NEGATIVE" },
  { label: "AB+", value: "AB_POSITIVE" },
  { label: "AB-", value: "AB_NEGATIVE" },
  { label: "O+", value: "O_POSITIVE" },
  { label: "O-", value: "O_NEGATIVE" },
];

export default function CompleteProfileScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!bloodGroup) {
      setError("Please select your blood group.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const signupToken = await getSignupToken();

      if (!signupToken) {
        setError("Your signup session has expired. Please login again.");
        return;
      }

      const result = await completeSignup(signupToken, {
        name: name.trim(),
        bloodGroup,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
      });

      await saveAuthTokens(result.accessToken, result.refreshToken);
      await clearSignupToken();
      await login();
      router.replace("/home");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 64 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-3xl font-bold text-[#B42335]">DUA</Text>

      <Text className="mt-8 text-3xl font-bold text-gray-900">
        Complete your profile
      </Text>

      <Text className="mt-2 text-base text-gray-500">
        Just a few details to get you started.
      </Text>

      <Text className="mb-2 mt-8 font-semibold text-gray-800">Full Name *</Text>

      <TextInput
        className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-gray-900"
        placeholder="Enter your full name"
        value={name}
        onChangeText={setName}
        editable={!loading}
      />

      <Text className="mb-3 mt-6 font-semibold text-gray-800">
        Blood Group *
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {BLOOD_GROUPS.map((group) => (
          <TouchableOpacity
            key={group.value}
            onPress={() => setBloodGroup(group.value)}
            disabled={loading}
            className={`w-[21%] items-center rounded-xl border py-4 ${
              bloodGroup === group.value
                ? "border-[#B42335] bg-[#B42335]"
                : "border-gray-300 bg-white"
            }`}
          >
            <Text
              className={`font-bold ${
                bloodGroup === group.value ? "text-white" : "text-gray-800"
              }`}
            >
              {group.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="mb-2 mt-6 font-semibold text-gray-800">
        Address (Optional)
      </Text>

      <TextInput
        className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-gray-900"
        placeholder="Enter your address"
        value={address}
        onChangeText={setAddress}
        editable={!loading}
      />

      <Text className="mb-2 mt-5 font-semibold text-gray-800">
        City (Optional)
      </Text>

      <TextInput
        className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-gray-900"
        placeholder="Enter your city"
        value={city}
        onChangeText={setCity}
        editable={!loading}
      />

      <Text className="mb-2 mt-5 font-semibold text-gray-800">
        State (Optional)
      </Text>

      <TextInput
        className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-gray-900"
        placeholder="Enter your state"
        value={state}
        onChangeText={setState}
        editable={!loading}
      />

      {error ? (
        <Text className="mt-4 text-sm text-red-600">{error}</Text>
      ) : null}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className="mt-8 items-center rounded-xl bg-[#B42335] py-4"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="font-bold text-white">Create Account</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
