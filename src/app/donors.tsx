import axios from "axios";
import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getDonors } from "@/api/donors";
import DonorCard from "@/components/DonorCard";
import type { DonorSearchResult } from "@/types/donorTypes";
import { createDonationRequest } from "@/api/donationRequests";
import { BLOOD_GROUPS, getBloodGroupLabel } from "@/constants/bloodGroups";
import type { BloodGroup } from "@/constants/bloodGroups";

const isBloodGroup = (value: string | undefined): value is BloodGroup =>
  BLOOD_GROUPS.some((group) => group.value === value);

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === "string") return responseMessage;
    if (!error.response) return "Check your connection and try again.";
  }

  return "Unable to load donors. Please try again.";
};

export default function Donors() {
  const { bloodGroup: bloodGroupParam } = useLocalSearchParams<{
    bloodGroup?: string | string[];
  }>();
  const bloodGroup = Array.isArray(bloodGroupParam)
    ? bloodGroupParam[0]
    : bloodGroupParam;
  const validBloodGroup = isBloodGroup(bloodGroup) ? bloodGroup : undefined;

  const [donors, setDonors] = useState<DonorSearchResult[]>([]);
  const [resultsBloodGroup, setResultsBloodGroup] = useState<BloodGroup>();
  const [selectedDonor, setSelectedDonor] = useState<DonorSearchResult | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    bloodGroup: BloodGroup | undefined;
    message: string;
  } | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchDonors = async () => {
      setDonors([]);
      setResultsBloodGroup(undefined);
      setSelectedDonor(null);
      setError(null);

      if (!validBloodGroup) {
        setLoading(false);
        setError({
          bloodGroup: undefined,
          message: "Choose a valid blood group to search for donors.",
        });
        return;
      }

      setLoading(true);
      try {
        const data = await getDonors(
          { bloodGroup: validBloodGroup },
          controller.signal,
        );

        if (!active) return;
        setDonors(data);
        setResultsBloodGroup(validBloodGroup);
      } catch (err) {
        if (active && !controller.signal.aborted) {
          setError({
            bloodGroup: validBloodGroup,
            message: getErrorMessage(err),
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchDonors();
    return () => {
      active = false;
      controller.abort();
    };
  }, [validBloodGroup, retry]);

  const visibleDonors =
    validBloodGroup && resultsBloodGroup === validBloodGroup ? donors : [];
  const visibleError =
    error && error.bloodGroup === validBloodGroup ? error.message : null;
  const isLoading =
    loading ||
    (validBloodGroup !== undefined &&
      resultsBloodGroup !== validBloodGroup &&
      visibleError === null);
  const visibleSelectedDonor =
    selectedDonor?.bloodGroup === validBloodGroup ? selectedDonor : null;

  const handleSendRequest = async () => {
    if (!visibleSelectedDonor || !validBloodGroup) return;

    try {
      await createDonationRequest({
        donorId: visibleSelectedDonor.id,
        bloodGroup: validBloodGroup,
      });

      alert("Donation request sent successfully!");
      setSelectedDonor(null);
    } catch {
      alert("Failed to send donation request.");
    }
  };

  const bloodGroupLabel = validBloodGroup
    ? getBloodGroupLabel(validBloodGroup)
    : "";

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 pt-16 pb-10"
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-3xl font-bold text-text">Available Donors</Text>

      <Text className="mb-6 mt-2 text-base text-muted">
        Donors with blood group {bloodGroupLabel}
      </Text>
      {isLoading && <Text className="text-muted">Searching for donors...</Text>}

      {!isLoading && visibleError && (
        <View className="items-center">
          <Text className="mb-3 text-error">{visibleError}</Text>

          <Pressable
            className="rounded-xl bg-primary px-6 py-3"
            onPress={() => setRetry((prev) => prev + 1)}
          >
            <Text className="font-bold text-white">Retry</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !visibleError && visibleDonors.length === 0 && (
        <Text className="text-muted">
          No donors found for blood group {bloodGroupLabel || "this selection"}.
        </Text>
      )}
      {visibleDonors.map((donor) => (
        <DonorCard
          key={donor.id}
          name={donor.name}
          bloodGroup={donor.bloodGroup}
          city={donor.city}
          state={donor.state}
          onRequest={() => setSelectedDonor(donor)}
        />
      ))}
      {visibleSelectedDonor && (
        <View className="mt-6 rounded-2xl border border-border p-5">
          <Text className="mb-4 text-xl font-bold text-text">
            Request Donation
          </Text>

          <Text className="mb-2 text-sm text-muted">
            Requesting blood from {visibleSelectedDonor.name}
          </Text>

          <Pressable
            className="rounded-xl bg-primary p-4"
            onPress={handleSendRequest}
          >
            <Text className="text-center font-bold text-white">
              Send Request
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
