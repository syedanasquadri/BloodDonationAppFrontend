import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from "@/api/notifications";

export default function NotificationPreferencesScreen() {
  const router = useRouter();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    bloodRequests: true,
    statusUpdates: true,
    announcements: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getNotificationPreferences()
      .then((data) => {
        if (active) {
          setPreferences(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.warn("Failed to load preferences:", err);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleToggle = async (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    const previous = { ...preferences };
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateNotificationPreferences({ [key]: value });
    } catch (err) {
      console.warn("Failed to update preferences:", err);
      setPreferences(previous);
      setErrorMessage("Could not save your preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 bg-white px-5 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100 active:opacity-70"
        >
          <Text className="text-lg font-bold text-gray-700">←</Text>
        </Pressable>
        <Text className="text-xl font-bold text-gray-900">
          Notification Preferences
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#B42335" />
          <Text className="mt-3 text-sm text-gray-500">
            Loading preferences...
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-5 py-6">
          {errorMessage && (
            <View className="mb-4 rounded-xl bg-red-50 p-3 border border-red-200">
              <Text className="text-sm font-medium text-red-700">
                {errorMessage}
              </Text>
            </View>
          )}

          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            Category Preferences
          </Text>

          <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {/* Blood Requests */}
            <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <View className="flex-1 pr-3">
                <Text className="text-base font-semibold text-gray-900">
                  Blood Donation Requests
                </Text>
                <Text className="mt-1 text-xs text-gray-500 leading-4">
                  Receive alerts when someone nearby urgently needs your blood group.
                </Text>
              </View>
              <Switch
                value={preferences.bloodRequests}
                onValueChange={(val) => handleToggle("bloodRequests", val)}
                trackColor={{ false: "#D1D5DB", true: "#B42335" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Request Status Updates */}
            <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <View className="flex-1 pr-3">
                <Text className="text-base font-semibold text-gray-900">
                  Request Status Updates
                </Text>
                <Text className="mt-1 text-xs text-gray-500 leading-4">
                  Updates when your requests are accepted, declined, or cancelled.
                </Text>
              </View>
              <Switch
                value={preferences.statusUpdates}
                onValueChange={(val) => handleToggle("statusUpdates", val)}
                trackColor={{ false: "#D1D5DB", true: "#B42335" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Platform Announcements */}
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1 pr-3">
                <Text className="text-base font-semibold text-gray-900">
                  Platform Announcements
                </Text>
                <Text className="mt-1 text-xs text-gray-500 leading-4">
                  Community updates, blood drive events, and news.
                </Text>
              </View>
              <Switch
                value={preferences.announcements}
                onValueChange={(val) => handleToggle("announcements", val)}
                trackColor={{ false: "#D1D5DB", true: "#B42335" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Security Notice */}
          <View className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-base">🔒</Text>
              <Text className="text-sm font-bold text-amber-900">
                Security & Critical Alerts
              </Text>
            </View>
            <Text className="text-xs text-amber-800 leading-4">
              Important account security alerts and verification notices are essential
              and will always be delivered to keep your account safe.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
