import { View, Text } from "react-native";
import { getBloodGroupLabel } from "@/constants/bloodGroups";
import type { BloodGroup } from "@/constants/bloodGroups";
import Button from "./Button";

type Props = {
  name: string;
  bloodGroup: BloodGroup;
  city: string | null;
  state: string | null;
  onRequest: () => void;
};

export default function DonorCard({
  name,
  bloodGroup,
  city,
  state,
  onRequest,
}: Props) {
  const location = [city, state]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");

  return (
    <View className="mb-[14px] rounded-2xl border border-border p-[18px]">
      <Text className="text-[19px] font-bold text-text">{name}</Text>

      <Text className="mb-4 mt-1.5 text-sm text-muted">
        {getBloodGroupLabel(bloodGroup)}{location ? ` • ${location}` : ""}
      </Text>

      <Button title="Request Donation" onPress={onRequest} />
    </View>
  );
}
