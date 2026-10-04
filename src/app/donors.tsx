import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getDonors } from "@/api/donors";
import DonorCard from "@/components/DonorCard";
import { Donor } from "@/types/donorTypes";

export default function Donors() {
  const { bloodGroup } = useLocalSearchParams<{
    bloodGroup: string;
  }>();

  const [donors, setDonors] = useState<Donor[]>([]);
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
            onPress={fetchDonors}
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
          onRequest={() => {}}
        />
      ))}
    </View>
  );
}
