import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-bold text-text">Good morning 👋</Text>
          <Text className="mt-2 text-base text-muted">
            Find blood when you need it.
          </Text>
        </View>

        <Pressable
          className="h-12 w-12 items-center justify-center rounded-full border border-border bg-white active:bg-gray-100"
          onPress={() => router.push("/myProfile")}
        >
          <Text className="text-base font-bold text-primary">SQ</Text>
        </Pressable>
      </View>

      <Text className="mb-3 mt-8 text-lg font-bold text-text">
        What would you like to do?
      </Text>
      <View className="gap-4">
        <Pressable
          className="rounded-2xl bg-primary p-5"
          onPress={() => router.push("/find-blood")}
        >
          <Text className="text-xl font-bold text-white">Find Blood</Text>

          <Text className="mt-1 text-white/80">
            Find nearby donors who can help.
          </Text>
        </Pressable>

        <Pressable
          className="rounded-2xl border border-border bg-white p-5"
          onPress={() => router.push("/register-donor")}
        >
          <Text className="text-xl font-bold text-primary">Donate Blood</Text>

          <Text className="mt-1 text-muted">
            Register as a donor and help save lives.
          </Text>
        </Pressable>

        <Pressable
          className="rounded-2xl border border-border bg-white p-5"
          onPress={() => router.push("/myProfile")}
        >
          <Text className="text-xl font-bold text-text">My Profile</Text>

          <Text className="mt-1 text-muted">
            View your details, donor status, and requests.
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
