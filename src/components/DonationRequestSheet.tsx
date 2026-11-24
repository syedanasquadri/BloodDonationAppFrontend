import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBloodGroupLabel } from "@/constants/bloodGroups";
import type { DonorSearchResult } from "@/types/donorTypes";

type Props = {
  donor: DonorSearchResult | null;
  visible: boolean;
  sending: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DonationRequestSheet({
  donor,
  visible,
  sending,
  error,
  onClose,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
  const location = [donor?.city, donor?.state]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");
  const distanceText =
    donor?.distanceKm !== undefined && donor?.distanceKm !== null
      ? donor.distanceKm === 0 || donor.distanceKm < 0.1
        ? "< 1 km away"
        : `${donor.distanceKm} km away`
      : null;
  const locationDetails = [location, distanceText].filter(Boolean).join(" · ");
  const dismiss = () => {
    if (!sending) onClose();
  };

  return (
    <Modal
      visible={visible && donor !== null}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close donation request confirmation"
          className="absolute inset-0 bg-black/45"
          onPress={dismiss}
          disabled={sending}
        />
        <View
          className="rounded-t-[28px] border-t border-border bg-background px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 20) + 16 }}
        >
          <View className="mb-5 flex-row items-center justify-between">
            <View className="h-1.5 w-10 rounded-full bg-border" />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="h-10 w-10 items-center justify-center rounded-full bg-white"
              onPress={dismiss}
              disabled={sending}
            >
              <Text className="text-xl text-muted">×</Text>
            </Pressable>
          </View>
          <Text className="text-2xl font-bold text-text">Send a request?</Text>
          <Text className="mb-5 mt-2 text-sm leading-5 text-muted">
            Your donation request will be sent directly to this donor.
          </Text>
          {donor && (
            <View className="mb-5 rounded-2xl border border-border bg-white p-4">
              <View className="flex-row items-center justify-between">
                <View className="mr-3 flex-1">
                  <Text className="text-xs font-medium uppercase tracking-wide text-muted">
                    Selected donor
                  </Text>
                  <Text className="mt-1 text-lg font-bold text-text">
                    {donor.name}
                  </Text>
                  {locationDetails ? (
                    <Text className="mt-1 text-sm text-muted">{locationDetails}</Text>
                  ) : null}
                </View>
                <View className="rounded-full bg-red-50 px-4 py-2">
                  <Text className="font-bold text-primary">
                    {getBloodGroupLabel(donor.bloodGroup)}
                  </Text>
                </View>
              </View>
            </View>
          )}
          {error ? (
            <View className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
              <Text className="text-sm leading-5 text-error">{error}</Text>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            className={`mb-3 h-[52px] items-center justify-center rounded-xl ${sending ? "bg-muted" : "bg-primary"}`}
            onPress={onConfirm}
            disabled={sending || !donor}
          >
            <Text className="font-bold text-white">
              {sending ? "Sending Request..." : "Confirm & Send Request"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className="h-12 items-center justify-center rounded-xl"
            onPress={dismiss}
            disabled={sending}
          >
            <Text
              className={`font-semibold ${sending ? "text-muted" : "text-text"}`}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
