import { createDonor } from "@/api/donors";
import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import Button from "@/components/Button";

export default function RegisterDonor() {
  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      await createDonor({
        name,
        bloodGroup,
        phone,
        address,
        city,
        state,
        latitude: null,
        longitude: null,
        isAvailable: true,
      });
      alert("Donor registered successfully!");
    } catch (e) {
      alert("Failed to register donor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <Text className="text-3xl font-bold text-text">Register as a Donor</Text>

      <Text className="mb-6 mt-2 text-base text-muted">
        Register your details and help save lives.
      </Text>

      <TextInput
        className="mb-4 rounded-xl border border-border bg-white px-4 py-4 text-text"
        placeholder="Name"
        placeholderTextColor="#737373"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        className="mb-4 rounded-xl border border-border bg-white px-4 py-4 text-text"
        placeholder="Blood Group"
        placeholderTextColor="#737373"
        value={bloodGroup}
        onChangeText={setBloodGroup}
      />

      <TextInput
        className="mb-4 rounded-xl border border-border bg-white px-4 py-4 text-text"
        placeholder="Phone"
        placeholderTextColor="#737373"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        className="mb-4 rounded-xl border border-border bg-white px-4 py-4 text-text"
        placeholder="Address"
        placeholderTextColor="#737373"
        value={address}
        onChangeText={setAddress}
      />

      <TextInput
        className="mb-4 rounded-xl border border-border bg-white px-4 py-4 text-text"
        placeholder="City"
        placeholderTextColor="#737373"
        value={city}
        onChangeText={setCity}
      />

      <TextInput
        className="mb-4 rounded-xl border border-border bg-white px-4 py-4 text-text"
        placeholder="State"
        placeholderTextColor="#737373"
        value={state}
        onChangeText={setState}
      />

      <Button
        title={loading ? "Registering..." : "Register as Donor"}
        onPress={handleRegister}
        disabled={loading}
      />
    </View>
  );
}
