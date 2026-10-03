import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { getDonors } from "@/api/donors";
import DonorCard from "@/components/DonorCard";

type Donor = {
  id: number;
  name: string;
  bloodGroup: string;
  phone: string;
  location: string;
};

export default function Donors() {
  const { bloodGroup } = useLocalSearchParams<{
    bloodGroup: string;
  }>();

  const [donors, setDonors] = useState<Donor[]>([]);

  useEffect(() => {
    const fetchDonors = async () => {
      const data = await getDonors();

      const filteredDonors = data.filter(
        (donor: Donor) => donor.bloodGroup === bloodGroup
      );

      setDonors(filteredDonors);
    };

    fetchDonors();
  }, [bloodGroup]);

  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <Text className="text-3xl font-bold text-text">
        Available Donors
      </Text>

      <Text className="mb-6 mt-2 text-base text-muted">
        Donors with blood group {bloodGroup}
      </Text>

      {donors.map((donor) => (
        <DonorCard
          key={donor.id}
          name={donor.name}
          bloodGroup={donor.bloodGroup}
          distance={donor.location}
          onRequest={() => {}}
        />
      ))}
    </View>
  );
}