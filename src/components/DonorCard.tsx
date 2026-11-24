import { View, Text } from "react-native";
import { getBloodGroupLabel } from "@/constants/bloodGroups";
import type { BloodGroup } from "@/constants/bloodGroups";
import Button from "./Button";

type Props = {
  name: string;
  bloodGroup: BloodGroup;
  city: string | null;
  state: string | null;
  distanceKm?: number | null;
  onRequest: () => void;
  disabled?: boolean;
  requested?: boolean;
};

export default function DonorCard({
  name,
  bloodGroup,
  city,
  state,
  distanceKm,
  onRequest,
  disabled = false,
  requested = false,
}: Props) {
  const location = [city, state]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");

  return (
    <View className="mb-[14px] rounded-2xl border border-border bg-white p-[18px]">
      <View className="flex-row items-center justify-between">
        <Text className="text-[19px] font-bold text-text">{name}</Text>
        {distanceKm !== undefined && distanceKm !== null && (
          <View className="rounded-full border border-red-100 bg-red-50 px-2.5 py-0.5">
            <Text className="text-xs font-semibold text-primary">
              {distanceKm === 0 || distanceKm < 0.1
                ? "< 1 km away"
                : `${distanceKm} km away`}
            </Text>
          </View>
        )}
      </View>
      <Text className="mb-4 mt-1.5 text-sm text-muted">
        {getBloodGroupLabel(bloodGroup)}
        {location ? ` · ${location}` : ""}
      </Text>
      {requested ? (
        <View className="h-[52px] flex-row items-center justify-center rounded-xl border border-red-100 bg-red-50">
          <Text className="font-bold text-primary">Request Sent · Pending</Text>
        </View>
      ) : (
        <Button
          title="Request Donation"
          onPress={onRequest}
          disabled={disabled}
        />
      )}
    </View>
  );
}
