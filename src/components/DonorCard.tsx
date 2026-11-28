import { View, Text } from "react-native";
import { getBloodGroupLabel } from "@/constants/bloodGroups";
import type { BloodGroup } from "@/constants/bloodGroups";
import type { MatchType } from "@/types/donorTypes";
import Button from "./Button";

type Props = {
  name: string;
  bloodGroup: BloodGroup;
  city: string | null;
  state: string | null;
  distanceKm?: number | null;
  matchType?: MatchType;
  onRequest: () => void;
  disabled?: boolean;
  requested?: boolean;
};

const MATCH_BADGE_STYLES: Record<
  MatchType,
  { container: string; text: string; label: string }
> = {
  EXACT: {
    container: "border-emerald-200 bg-emerald-50",
    text: "text-emerald-700",
    label: "Exact Match",
  },
  COMPATIBLE: {
    container: "border-amber-200 bg-amber-50",
    text: "text-amber-800",
    label: "Compatible",
  },
};

export default function DonorCard({
  name,
  bloodGroup,
  city,
  state,
  distanceKm,
  matchType,
  onRequest,
  disabled = false,
  requested = false,
}: Props) {
  const location = [city, state]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");
  const matchBadge = matchType ? MATCH_BADGE_STYLES[matchType] : null;

  return (
    <View className="mb-[14px] rounded-2xl border border-border bg-white p-[18px]">
      <View className="flex-row items-center justify-between">
        <Text className="mr-2 flex-1 text-[19px] font-bold text-text">
          {name}
        </Text>
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
      <View className="mb-4 mt-1.5 flex-row flex-wrap items-center gap-2">
        <Text className="text-sm text-muted">
          {getBloodGroupLabel(bloodGroup)}
          {location ? ` · ${location}` : ""}
        </Text>
        {matchBadge && (
          <View
            className={`rounded-full border px-2.5 py-0.5 ${matchBadge.container}`}
          >
            <Text className={`text-xs font-semibold ${matchBadge.text}`}>
              {matchBadge.label}
            </Text>
          </View>
        )}
      </View>
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
