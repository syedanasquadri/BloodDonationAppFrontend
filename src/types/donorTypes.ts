export type Donor = {
  id: number;
  name: string;
  bloodGroup: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  isAvailable: boolean;
};

export type CreateDonorInput = {
  name: string;
  bloodGroup: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
};

export type DonorFilters = {
  bloodGroup?: string;
  city?: string;
  state?: string;
};