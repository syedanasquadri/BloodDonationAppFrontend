import { View, Text } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import BloodGroupButton from "../components/BloodGroupButton";
import Button from "../components/Button";
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function FindBlood() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const handleFindDonors = () => {
    if (!selectedGroup) return;

    router.push({
      pathname: "/donors",
      params: {
        bloodGroup: selectedGroup,
      },
    });
  };

  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <Text className="text-3xl font-bold text-text">Find Blood</Text>

      <Text className="mb-6 mt-2 text-base text-muted">
        Select the blood group you need
      </Text>

      <View className="mb-6 flex-row flex-wrap justify-between gap-4">
        {bloodGroups.map((group) => (
          <BloodGroupButton
            key={group}
            group={group}
            selected={selectedGroup === group}
            onPress={() => setSelectedGroup(group)}
          />
        ))}
      </View>

      <Button title="Find Donors" onPress={handleFindDonors} />
    </View>
  );
}
