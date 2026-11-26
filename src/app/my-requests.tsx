import axios from "axios";
import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { getSentDonationRequests } from "@/api/donationRequests";
import type {
  DonationRequestRecord,
  DonationRequestStatus,
} from "@/api/donationRequests";
import { getBloodGroupLabel } from "@/constants/bloodGroups";

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === "string") return responseMessage;
    if (!error.response) return "Check your connection and try again.";
  }

  return "Unable to load your requests. Please try again.";
};

const getStatusStyle = (status: DonationRequestStatus) => {
  switch (status) {
    case "PENDING":
      return { badge: "bg-amber-50", text: "text-warning" };
    case "ACCEPTED":
      return { badge: "bg-green-50", text: "text-success" };
    case "REJECTED":
    case "CANCELLED":
      return { badge: "bg-red-50", text: "text-error" };
  }
};

const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const handleCall = async (phone: string) => {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned) {
    Alert.alert("Invalid Phone Number", "No valid phone number found to call.");
    return;
  }
  const url = `tel:${cleaned}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      "Unable to make a call",
      `Could not open the phone dialer. Please dial ${phone} directly.`,
    );
  }
};

const handleWhatsApp = async (phone: string) => {
  let digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length === 10) {
    digitsOnly = `91${digitsOnly}`;
  }
  if (!digitsOnly) {
    Alert.alert("Invalid Phone Number", "No valid phone number found for WhatsApp.");
    return;
  }
  const url = `https://wa.me/${digitsOnly}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      "Unable to open WhatsApp",
      "Could not open WhatsApp. Please ensure WhatsApp is installed on your device.",
    );
  }
};

export default function MyRequestsScreen() {
  const [requests, setRequests] = useState<DonationRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadRequests = async () => {
      setError(null);
      if (reloadKey === 0) setLoading(true);
      else setRefreshing(true);

      try {
        const data = await getSentDonationRequests(controller.signal);
        if (active) setRequests(data);
      } catch (loadError) {
        if (active && !controller.signal.aborted) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
          setHasLoaded(true);
        }
      }
    };

    void loadRequests();
    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  const refreshRequests = () => {
    if (loading || refreshing) return;
    setRefreshing(true);
    setReloadKey((current) => current + 1);
  };

  const isFetching = loading || refreshing;

  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerClassName="px-5 pb-10 pt-16"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshRequests} />
      }
    >
      <View className="mb-6 flex-row items-center justify-between">
        <View className="mr-3 flex-1">
          <Text className="text-3xl font-bold text-text">My Requests</Text>
          <Text className="mt-2 text-base text-muted">
            Track the requests you've sent
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh my requests"
          className="rounded-xl border border-border bg-white px-4 py-3"
          onPress={refreshRequests}
          disabled={loading || refreshing}
        >
          <Text className="font-semibold text-primary">
            {refreshing ? "Refreshing..." : "Refresh"}
          </Text>
        </Pressable>
      </View>

      {isFetching && requests.length === 0 && (
        <Text className="py-6 text-center text-muted">
          {hasLoaded ? "Refreshing requests..." : "Loading your requests..."}
        </Text>
      )}

      {!isFetching && error && (
        <View className="items-center rounded-2xl border border-border bg-white p-6">
          <Text className="mb-4 text-center text-error">{error}</Text>
          <Pressable
            className="rounded-xl bg-primary px-6 py-3"
            onPress={refreshRequests}
            disabled={refreshing}
          >
            <Text className="font-bold text-white">Retry</Text>
          </Pressable>
        </View>
      )}

      {!isFetching && !error && requests.length === 0 && (
        <View className="items-center rounded-2xl border border-border bg-white px-6 py-10">
          <Text className="text-lg font-bold text-text">No sent requests yet</Text>
          <Text className="mt-2 text-center text-muted">
            Requests you send to donors will appear here.
          </Text>
        </View>
      )}

      {requests.map((request) => {
        const statusStyle = getStatusStyle(request.status);
        const createdAt = formatDate(request.createdAt);
        const donorName = request.donor?.name ?? `Donor #${request.donorId}`;
        const location = [request.donor?.city, request.donor?.state]
          .map((part) => part?.trim())
          .filter((part): part is string => Boolean(part))
          .join(", ");
        const isAccepted = request.status === "ACCEPTED";
        const phone = isAccepted ? request.donor?.phone : null;

        return (
          <View
            key={request.id}
            className="mb-4 rounded-2xl border border-border bg-white p-5"
          >
            <View className="mb-4 flex-row items-start justify-between">
              <View className="mr-3 flex-1">
                <Text className="text-lg font-bold text-text">
                  {donorName}
                </Text>
                <Text className="mt-1 text-sm text-muted">
                  {location ? location : `Request #${request.id}`}
                </Text>
              </View>
              <View className={`rounded-full px-3 py-1.5 ${statusStyle.badge}`}>
                <Text className={`text-xs font-bold ${statusStyle.text}`}>
                  {request.status}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between rounded-xl bg-background px-4 py-3">
              <View>
                <Text className="text-sm text-muted">Requested blood group</Text>
                <Text className="mt-1 text-xl font-bold text-primary">
                  {getBloodGroupLabel(request.bloodGroup)}
                </Text>
              </View>
              {createdAt ? (
                <View className="ml-3 flex-1 items-end">
                  <Text className="text-xs text-muted">Sent</Text>
                  <Text className="mt-1 text-right text-sm font-medium text-text">
                    {createdAt}
                  </Text>
                </View>
              ) : null}
            </View>

            {isAccepted && phone ? (
              <View className="mt-4 rounded-xl border border-green-200 bg-green-50/70 p-3.5">
                <Text className="text-xs font-semibold uppercase tracking-wider text-green-800">
                  Donor Contact Details
                </Text>
                <Text className="mt-1 text-base font-bold text-text">
                  {phone}
                </Text>
                <View className="mt-3 flex-row gap-2.5">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${donorName}`}
                    className="flex-1 flex-row items-center justify-center rounded-xl bg-primary py-2.5 active:opacity-80"
                    onPress={() => void handleCall(phone)}
                  >
                    <Text className="font-bold text-white">📞 Call</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`WhatsApp ${donorName}`}
                    className="flex-1 flex-row items-center justify-center rounded-xl bg-[#25D366] py-2.5 active:opacity-80"
                    onPress={() => void handleWhatsApp(phone)}
                  >
                    <Text className="font-bold text-white">💬 WhatsApp</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}
