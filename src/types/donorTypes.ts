import type { BloodGroup } from "@/constants/bloodGroups";

export type MatchType = "EXACT" | "COMPATIBLE";

export type DonorSearchResult = {
  id: number;
  name: string;
  bloodGroup: BloodGroup;
  city: string | null;
  state: string | null;
  distanceKm?: number | null;
  matchType?: MatchType;
};

export type DonorFilters = {
  bloodGroup?: BloodGroup;
  lat?: number;
  lng?: number;
};
