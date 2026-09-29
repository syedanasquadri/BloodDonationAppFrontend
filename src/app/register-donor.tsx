import { createDonor } from "@/api/donors";
import { useState } from "react";
import { View, TextInput, Button } from "react-native";

export default function RegisterDonor() {
  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const handleRegister = async () => {
    await createDonor({
      name,
      bloodGroup,
      phone,
      location,
      isAvailable: true,
    });
  };

  return (
    <View>
      <TextInput placeholder="Name" value={name} onChangeText={setName} />

      <TextInput
        placeholder="Blood Group"
        value={bloodGroup}
        onChangeText={setBloodGroup}
      />

      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} />

      <TextInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}
