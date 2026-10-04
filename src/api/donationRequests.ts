import axios from "axios";

const API_URL = "http://localhost:3000";

export type CreateDonationRequestInput = {
  donorId: number;
  requesterName: string;
  requesterPhone: string;
  bloodGroup: string;
};

export const createDonationRequest = async (
  request: CreateDonationRequestInput,
) => {
  const response = await axios.post(
    `${API_URL}/api/donation-requests`,
    request,
  );

  return response.data;
};