import { CreateDonorInput, DonorFilters, Donor } from "@/types/donorTypes";
import axios from "axios";

const API_URL = "http://localhost:3000";

export const getDonors = async (filters: DonorFilters) => {
  const response = await axios.get(`${API_URL}/api/donors`, {
    params: filters,
  });
  return response.data as Donor[];
};

export const createDonor = async (donor: CreateDonorInput) => {
  const response = await axios.post(`${API_URL}/api/donors`, donor);
  return response.data;
};
