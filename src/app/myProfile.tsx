import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function MyProfileScreen() {
  const profile = {
    name: "Abdulla Rayan",
    phone: "+91 98765 43210",
    city: "Bengaluru",
    state: "Karnataka",
    bloodGroup: "O+",
    donorStatus: "Active",
  };

  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <Pressable
        className="absolute right-5 top-14 rounded-full bg-primary px-4 py-2"
        onPress={() => router.push("/")}
      >
        <Text className="text-sm font-bold text-white">Home</Text>
      </Pressable>

      <View className="mt-6 items-center">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary">
          <Text className="text-3xl font-bold text-white">
            {profile.name.charAt(0)}
          </Text>
        </View>

        <Text className="mt-4 text-2xl font-bold text-text">
          {profile.name}
        </Text>

        <Text className="mt-1 text-base text-muted">
          {profile.phone}
        </Text>

        <View className="mt-4 flex-row gap-3">
          <Pressable className="rounded-full bg-success px-5 py-2">
            <Text className="text-sm font-bold text-white">
              Edit Profile
            </Text>
          </Pressable>

          <Pressable className="rounded-full bg-success px-5 py-2">
            <Text className="text-sm font-bold text-white">
              My Requests
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-8 rounded-2xl border border-border bg-white p-5">
        <Text className="text-lg font-bold text-text">
          Personal Information
        </Text>

        <View className="mt-4 gap-4">
          <View>
            <Text className="text-sm text-muted">City</Text>
            <Text className="mt-1 text-base font-semibold text-text">
              {profile.city}
            </Text>
          </View>

          <View>
            <Text className="text-sm text-muted">State</Text>
            <Text className="mt-1 text-base font-semibold text-text">
              {profile.state}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 rounded-2xl border border-border bg-white p-5">
        <Text className="text-lg font-bold text-text">
          Blood Information
        </Text>

        <View className="mt-4 flex-row justify-between">
          <View>
            <Text className="text-sm text-muted">Blood Group</Text>
            <Text className="mt-1 text-xl font-bold text-primary">
              {profile.bloodGroup}
            </Text>
          </View>

          <View>
            <Text className="text-sm text-muted">Donor Status</Text>
            <Text className="mt-1 text-base font-bold text-success">
              {profile.donorStatus}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-6">
        <Pressable className="rounded-2xl bg-primary p-4">
          <Text className="text-center text-base font-bold text-white">
            Logout
          </Text>
        </Pressable>
      </View>
    </View>
  );
}