import axios from "axios";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  getCurrentUserProfile,
  updateUserProfile,
} from "@/api/users";
import type {
  UpdateUserProfileInput,
  UserProfile,
} from "@/api/users";
import { BLOOD_GROUPS, getBloodGroupLabel } from "@/constants/bloodGroups";
import type { BloodGroup } from "@/constants/bloodGroups";
import { useAuth } from "@/context/AuthContext";

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === "string") return responseMessage;
    if (!error.response) return "Check your connection and try again.";
  }

  return "Unable to load your profile. Please try again.";
};

const getSaveErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === "string") return responseMessage;
    if (!error.response) return "Check your connection and try again.";
  }

  return "Unable to save your profile. Please try again.";
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DU";

type DetailProps = { label: string; value: string | null };

function Detail({ label, value }: DetailProps) {
  return (
    <View className="border-b border-border py-3 last:border-b-0">
      <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </Text>
      <Text className="mt-1 text-base font-medium text-text">
        {value?.trim() || "Not provided"}
      </Text>
    </View>
  );
}

type EditFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  editable?: boolean;
};

function EditField({ label, value, onChangeText, editable = true }: EditFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-text">{label}</Text>
      <TextInput
        className="rounded-xl border border-border bg-white px-4 py-3 text-text"
        value={value}
        onChangeText={onChangeText}
        editable={editable}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draft, setDraft] = useState<UpdateUserProfileInput>({});
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setLoadError(null);
    getCurrentUserProfile(controller.signal)
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch((error: unknown) => {
        if (active && !controller.signal.aborted) {
          setLoadError(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [retryKey]);

  const beginEditing = () => {
    if (!profile) return;
    setDraft({
      name: profile.name,
      bloodGroup: profile.bloodGroup,
      address: profile.address,
      city: profile.city,
      state: profile.state,
    });
    setSaveError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setSaveError(null);
  };

  const saveProfile = async () => {
    if (!profile) return;
    if (!draft.name?.trim()) {
      setSaveError("Name is required.");
      return;
    }
    if (!draft.bloodGroup) {
      setSaveError("Select your blood group.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateUserProfile(profile.id, {
        name: draft.name.trim(),
        bloodGroup: draft.bloodGroup,
        address: draft.address?.trim() || null,
        city: draft.city?.trim() || null,
        state: draft.state?.trim() || null,
      });
      setProfile((current) => (current ? { ...current, ...updated } : current));
      setEditing(false);
    } catch (error) {
      setSaveError(getSaveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.replace("/(auth)/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const setDraftText = (field: "name" | "address" | "city" | "state", value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-3"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            className="rounded-xl border border-border bg-white px-4 py-2.5"
          >
            <Text className="font-semibold text-primary">Back</Text>
          </Pressable>
          <Text className="text-lg font-bold text-text">My Profile</Text>
          <View className="w-[58px]" />
        </View>

        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator color="#B42335" />
            <Text className="mt-4 text-muted">Loading your profile...</Text>
          </View>
        ) : loadError ? (
          <View className="items-center rounded-2xl border border-border bg-white p-6">
            <Text className="mb-4 text-center text-error">{loadError}</Text>
            <Pressable
              className="rounded-xl bg-primary px-6 py-3"
              onPress={() => setRetryKey((key) => key + 1)}
            >
              <Text className="font-bold text-white">Retry</Text>
            </Pressable>
          </View>
        ) : profile ? (
          <>
            <View className="mb-5 items-center rounded-3xl border border-border bg-white px-5 py-7">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-[#B42335]">
                <Text className="text-2xl font-bold text-white">
                  {getInitials(profile.name)}
                </Text>
              </View>
              <Text className="mt-4 text-2xl font-bold text-text">
                {profile.name}
              </Text>
              <Text className="mt-1 text-base text-muted">{profile.phone}</Text>
              <View className="mt-4 rounded-full bg-red-50 px-4 py-2">
                <Text className="font-bold text-primary">
                  {getBloodGroupLabel(profile.bloodGroup)}
                </Text>
              </View>
              <Text
                className={`mt-3 text-sm font-semibold ${profile.isPhoneVerified ? "text-success" : "text-muted"}`}
              >
                {profile.isPhoneVerified ? "Phone verified" : "Phone not verified"}
              </Text>
            </View>

            {editing ? (
              <View className="mb-5 rounded-2xl border border-border bg-white p-5">
                <Text className="mb-5 text-lg font-bold text-text">
                  Edit your details
                </Text>
                <EditField
                  label="Name"
                  value={draft.name ?? ""}
                  onChangeText={(value) => setDraftText("name", value)}
                />
                <Text className="mb-2 text-sm font-semibold text-text">
                  Blood group
                </Text>
                <View className="mb-4 flex-row flex-wrap gap-2">
                  {BLOOD_GROUPS.map((group) => (
                    <Pressable
                      key={group.value}
                      disabled={saving}
                      onPress={() =>
                        setDraft((current) => ({
                          ...current,
                          bloodGroup: group.value as BloodGroup,
                        }))
                      }
                      className={`rounded-full border px-3 py-2 ${draft.bloodGroup === group.value ? "border-primary bg-primary" : "border-border bg-white"}`}
                    >
                      <Text
                        className={`font-semibold ${draft.bloodGroup === group.value ? "text-white" : "text-text"}`}
                      >
                        {group.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <EditField
                  label="Address"
                  value={draft.address ?? ""}
                  onChangeText={(value) => setDraftText("address", value)}
                />
                <EditField
                  label="City"
                  value={draft.city ?? ""}
                  onChangeText={(value) => setDraftText("city", value)}
                />
                <EditField
                  label="State"
                  value={draft.state ?? ""}
                  onChangeText={(value) => setDraftText("state", value)}
                />
                <Text className="mb-4 text-sm text-muted">
                  Phone number changes are not available here.
                </Text>
                {saveError ? (
                  <Text className="mb-4 text-sm text-error">{saveError}</Text>
                ) : null}
                <View className="flex-row gap-3">
                  <Pressable
                    className="flex-1 items-center rounded-xl border border-border bg-white py-3"
                    onPress={cancelEditing}
                    disabled={saving}
                  >
                    <Text className="font-bold text-text">Cancel</Text>
                  </Pressable>
                  <Pressable
                    className="flex-1 items-center rounded-xl bg-primary py-3"
                    onPress={() => void saveProfile()}
                    disabled={saving}
                  >
                    <Text className="font-bold text-white">
                      {saving ? "Saving..." : "Save Changes"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <View className="mb-4 rounded-2xl border border-border bg-white px-5 py-2">
                  <Text className="py-3 text-lg font-bold text-text">
                    Personal information
                  </Text>
                  <Detail label="Name" value={profile.name} />
                  <Detail label="Phone" value={profile.phone} />
                  <Detail
                    label="Phone verification"
                    value={profile.isPhoneVerified ? "Verified" : "Not verified"}
                  />
                </View>

                <View className="mb-5 rounded-2xl border border-border bg-white px-5 py-2">
                  <Text className="py-3 text-lg font-bold text-text">
                    Location
                  </Text>
                  <Detail label="Address" value={profile.address} />
                  <Detail label="City" value={profile.city} />
                  <Detail label="State" value={profile.state} />
                </View>

                <Pressable
                  className="mb-3 items-center rounded-xl bg-primary py-4"
                  onPress={beginEditing}
                >
                  <Text className="font-bold text-white">Edit Profile</Text>
                </Pressable>
                <Pressable
                  className="mb-3 items-center rounded-xl border border-border bg-white py-4"
                  onPress={() => router.push("/my-requests")}
                >
                  <Text className="font-bold text-primary">My Requests</Text>
                </Pressable>
                <Pressable
                  className="mb-3 items-center rounded-xl border border-border bg-white py-4"
                  onPress={() => router.push("/notification-preferences")}
                >
                  <Text className="font-bold text-gray-700">Notification Preferences</Text>
                </Pressable>
              </>
            )}

            <Pressable
              className="mt-2 items-center rounded-xl border border-red-200 bg-white py-4"
              onPress={() => void handleLogout()}
              disabled={loggingOut}
            >
              <Text className="font-bold text-error">
                {loggingOut ? "Signing out..." : "Log Out"}
              </Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
