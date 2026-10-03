import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getDonors } from "@/api/donors";
import DonorCard from "@/components/DonorCard";
import { Donor } from "@/types/donorTypes";


export default function Donors() {
  const { bloodGroup } = useLocalSearchParams<{
    bloodGroup: string;
  }>();

  const [donors, setDonors] = useState<Donor[]>([]);

  useEffect(() => {
    const fetchDonors = async () => {
      const data = await getDonors({bloodGroup});

     setDonors(data);
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
          city={donor.city}
          state={donor.state}
          onRequest={() => {}}
        />
      ))}
    </View>
  );
}