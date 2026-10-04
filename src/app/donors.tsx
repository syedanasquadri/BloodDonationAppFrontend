import { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getDonors } from "@/api/donors";
import DonorCard from "@/components/DonorCard";
import { Donor } from "@/types/donorTypes";
import { createDonationRequest } from "@/api/donationRequests";

export default function Donors() {
  const { bloodGroup } = useLocalSearchParams<{
    bloodGroup: string;
  }>();

  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [requesterName, setRequesterName] = useState("");
  const [requesterPhone, setRequesterPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await getDonors({ bloodGroup });

        setDonors(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [bloodGroup]);
  const handleSendRequest = async () => {
    if (!selectedDonor) return;

    try {
      await createDonationRequest({
        donorId: selectedDonor.id,
        requesterName,
        requesterPhone,
        bloodGroup,
      });

      alert("Donation request sent successfully!");

      setSelectedDonor(null);
      setRequesterName("");
      setRequesterPhone("");
    } catch (error) {
      alert("Failed to send donation request.");
    }
  };
  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <Text className="text-3xl font-bold text-text">Available Donors</Text>

      <Text className="mb-6 mt-2 text-base text-muted">
        Donors with blood group {bloodGroup}
      </Text>
      {loading && <Text className="text-muted">Searching for donors...</Text>}

      {!loading && error && (
        <View className="items-center">
          <Text className="mb-3 text-error">
            Something went wrong. Please try again.
          </Text>

          <Pressable
            className="rounded-xl bg-primary px-6 py-3"
            onPress={handleSendRequest}
          >
            <Text className="font-bold text-white">Retry</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && donors.length === 0 && (
        <Text className="text-muted">
          No donors found for blood group {bloodGroup}.
        </Text>
      )}
      {donors.map((donor) => (
        <DonorCard
          key={donor.id}
          name={donor.name}
          bloodGroup={donor.bloodGroup}
          city={donor.city}
          state={donor.state}
          onRequest={() => setSelectedDonor(donor)}
        />
      ))}
      {selectedDonor && (
        <View className="mt-6 rounded-2xl border border-border p-5">
          <Text className="mb-4 text-xl font-bold text-text">
            Request Donation
          </Text>

          <Text className="mb-2 text-sm text-muted">
            Requesting blood from {selectedDonor.name}
          </Text>

          <TextInput
            className="mb-4 rounded-xl border border-border bg-white px-4 py-4 text-text"
            placeholder="Your name"
            placeholderTextColor="#737373"
            value={requesterName}
            onChangeText={setRequesterName}
          />

          <TextInput
            className="mb-4 rounded-xl border border-border bg-white px-4 py-4 text-text"
            placeholder="Your phone number"
            placeholderTextColor="#737373"
            keyboardType="phone-pad"
            value={requesterPhone}
            onChangeText={setRequesterPhone}
          />

          <Pressable className="rounded-xl bg-primary p-4" onPress={handleSendRequest}>
            <Text className="text-center font-bold text-white">
              Send Request
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
