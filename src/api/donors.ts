import { Donor } from "@/types/donorTypes";
import axios from "axios";

const API_URL = "http://YOUR_COMPUTER_IP:3000";

export const getDonors = async () => {
  const response = await axios.get(`${API_URL}/api/donors`);
  return response.data;
};

export const createDonor = async (donor: Omit<Donor, "id">) => {
  const response = await axios.post(`${API_URL}/api/donors`, donor);
  return response.data;
};
