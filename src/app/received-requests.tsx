import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  getReceivedDonationRequests,
  updateDonationRequestStatus,
} from "@/api/donationRequests";
import type {
  DonationRequestDecision,
  DonationRequestStatus,
  ReceivedDonationRequest,
} from "@/api/donationRequests";
import { getBloodGroupLabel } from "@/constants/bloodGroups";

type ActionFeedback = {
  kind: "success" | "error";
  message: string;
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === "string") return responseMessage;
    if (!error.response) return "Check your connection and try again.";
  }

  return "Unable to load received requests. Please try again.";
};

const getActionErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === "string") return responseMessage;
    if (!error.response) return "Check your connection and try again.";
  }

  return "Unable to update this request. Please try again.";
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
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
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

export default function ReceivedRequestsScreen() {
  const [requests, setRequests] = useState<ReceivedDonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingRequestId, setUpdatingRequestId] = useState<number | null>(
    null,
  );
  const [actionFeedback, setActionFeedback] = useState<
    Record<number, ActionFeedback | undefined>
  >({});
  const updateInFlight = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadRequests = async () => {
      setLoadError(null);
      if (reloadKey === 0) setLoading(true);
      else setRefreshing(true);

      try {
        const data = await getReceivedDonationRequests(controller.signal);
        if (active) setRequests(data);
      } catch (error) {
        if (active && !controller.signal.aborted) {
          setLoadError(getErrorMessage(error));
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
    if (refreshing || loading) return;
    setRefreshing(true);
    setReloadKey((current) => current + 1);
  };

  const handleDecision = async (
    request: ReceivedDonationRequest,
    status: DonationRequestDecision,
  ) => {
    if (updateInFlight.current || request.status !== "PENDING") return;

    updateInFlight.current = true;
    setUpdatingRequestId(request.id);
    setActionFeedback((current) => ({ ...current, [request.id]: undefined }));

    try {
      const updatedRequest = await updateDonationRequestStatus(
        request.id,
        status,
      );
      setRequests((current) =>
        current.map((item) =>
          item.id === updatedRequest.id ? updatedRequest : item,
        ),
      );
      setActionFeedback((current) => ({
        ...current,
        [request.id]: {
          kind: "success",
          message:
            status === "ACCEPTED"
              ? "Request accepted."
              : "Request rejected.",
        },
      }));
    } catch (error) {
      setActionFeedback((current) => ({
        ...current,
        [request.id]: {
          kind: "error",
          message: getActionErrorMessage(error),
        },
      }));
    } finally {
      updateInFlight.current = false;
      setUpdatingRequestId(null);
    }
  };

  const isFetching = loading || refreshing;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 pb-10 pt-16"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshRequests} />
      }
    >
      <View className="mb-6 flex-row items-center justify-between">
        <View className="mr-3 flex-1">
          <Text className="text-3xl font-bold text-text">
            Received Requests
          </Text>
          <Text className="mt-2 text-base text-muted">
            Blood donation requests sent to you
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh received requests"
          className="rounded-xl border border-border bg-white px-4 py-3"
          onPress={refreshRequests}
          disabled={refreshing}
        >
          <Text className="font-semibold text-primary">
            {refreshing ? "Refreshing..." : "Refresh"}
          </Text>
        </Pressable>
      </View>

      {isFetching && requests.length === 0 && (
        <Text className="py-6 text-center text-muted">
          {hasLoaded ? "Refreshing requests..." : "Loading received requests..."}
        </Text>
      )}

      {!isFetching && loadError && (
        <View className="items-center rounded-2xl border border-border bg-white p-6">
          <Text className="mb-4 text-center text-error">{loadError}</Text>
          <Pressable
            className="rounded-xl bg-primary px-6 py-3"
            onPress={refreshRequests}
            disabled={refreshing}
          >
            <Text className="font-bold text-white">Retry</Text>
          </Pressable>
        </View>
      )}

      {!isFetching && !loadError && requests.length === 0 && (
        <View className="items-center rounded-2xl border border-border bg-white px-6 py-10">
          <Text className="text-lg font-bold text-text">
            No received requests yet
          </Text>
          <Text className="mt-2 text-center text-muted">
            New donation requests will appear here.
          </Text>
        </View>
      )}

      {requests.map((request) => {
        const feedback = actionFeedback[request.id];
        const createdAt = formatDate(request.createdAt);
        const statusStyle = getStatusStyle(request.status);
        const requesterName =
          request.requester?.name ?? `Requester #${request.requesterId}`;
        const location = [request.requester?.city, request.requester?.state]
          .map((part) => part?.trim())
          .filter((part): part is string => Boolean(part))
          .join(", ");
        const isAccepted = request.status === "ACCEPTED";
        const phone = isAccepted ? request.requester?.phone : null;

        return (
          <View
            key={request.id}
            className="mb-4 rounded-2xl border border-border bg-white p-5"
          >
            <View className="mb-4 flex-row items-start justify-between">
              <View className="mr-3 flex-1">
                <Text className="text-lg font-bold text-text">
                  {requesterName}
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

            <View className="mb-4 flex-row items-center justify-between rounded-xl bg-background p-4">
              <View>
                <Text className="text-sm text-muted">Requested blood group</Text>
                <Text className="mt-1 text-2xl font-bold text-primary">
                  {getBloodGroupLabel(request.bloodGroup)}
                </Text>
              </View>
              {createdAt ? (
                <View className="ml-3 flex-1 items-end">
                  <Text className="text-xs text-muted">Received</Text>
                  <Text className="mt-1 text-right text-sm font-medium text-text">
                    {createdAt}
                  </Text>
                </View>
              ) : null}
            </View>

            {isAccepted && phone ? (
              <View className="mb-4 rounded-xl border border-green-200 bg-green-50/70 p-3.5">
                <Text className="text-xs font-semibold uppercase tracking-wider text-green-800">
                  Requester Contact Details
                </Text>
                <Text className="mt-1 text-base font-bold text-text">
                  {phone}
                </Text>
                <View className="mt-3 flex-row gap-2.5">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${requesterName}`}
                    className="flex-1 flex-row items-center justify-center rounded-xl bg-primary py-2.5 active:opacity-80"
                    onPress={() => void handleCall(phone)}
                  >
                    <Text className="font-bold text-white">📞 Call</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`WhatsApp ${requesterName}`}
                    className="flex-1 flex-row items-center justify-center rounded-xl bg-[#25D366] py-2.5 active:opacity-80"
                    onPress={() => void handleWhatsApp(phone)}
                  >
                    <Text className="font-bold text-white">💬 WhatsApp</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {feedback && (
              <View
                className={`mb-4 rounded-xl p-3 ${feedback.kind === "success" ? "bg-green-50" : "bg-red-50"}`}
              >
                <Text
                  className={`text-sm font-medium ${feedback.kind === "success" ? "text-success" : "text-error"}`}
                >
                  {feedback.message}
                </Text>
              </View>
            )}

            {request.status === "PENDING" && (
              <View className="flex-row gap-3">
                <Pressable
                  className={`flex-1 items-center rounded-xl px-4 py-3 ${updatingRequestId === request.id ? "bg-muted" : "bg-primary"}`}
                  onPress={() => void handleDecision(request, "ACCEPTED")}
                  disabled={updatingRequestId !== null}
                >
                  <Text className="font-bold text-white">
                    {updatingRequestId === request.id
                      ? "Updating..."
                      : "Accept"}
                  </Text>
                </Pressable>
                <Pressable
                  className={`flex-1 items-center rounded-xl border border-border px-4 py-3 ${updatingRequestId === request.id ? "bg-muted" : "bg-white"}`}
                  onPress={() => void handleDecision(request, "REJECTED")}
                  disabled={updatingRequestId !== null}
                >
                  <Text
                    className={`font-bold ${updatingRequestId === request.id ? "text-white" : "text-error"}`}
                  >
                    Reject
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
