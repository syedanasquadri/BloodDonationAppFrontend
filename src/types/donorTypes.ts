import type { BloodGroup } from "@/constants/bloodGroups";

export type DonorSearchResult = {
  id: number;
  name: string;
  bloodGroup: BloodGroup;
  city: string | null;
  state: string | null;
};

export type DonorFilters = {
  bloodGroup?: BloodGroup;
};
