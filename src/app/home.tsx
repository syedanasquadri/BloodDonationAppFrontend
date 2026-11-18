import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getCurrentUserProfile } from "@/api/users";
import type { UserProfile } from "@/api/users";

type ActionCardProps = {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
};

function ActionCard({ icon, title, description, onPress }: ActionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-[142px] flex-1 rounded-2xl border border-border bg-white p-4 active:opacity-80"
    >
      <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-red-50">
        <Text className="text-xl font-bold text-primary">{icon}</Text>
      </View>
      <Text className="text-base font-bold text-text">{title}</Text>
      <Text className="mt-1 text-sm leading-5 text-muted">{description}</Text>
    </Pressable>
  );
}

const getInitials = (name?: string) =>
  name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DU";

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    getCurrentUserProfile(controller.signal)
      .then((user) => {
        if (active) setProfile(user);
      })
      .catch(() => {
        // The dashboard remains usable if the profile request cannot load.
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const firstName = profile?.name.trim().split(/\s+/)[0];

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-extrabold tracking-wide text-[#B42335]">
              DUA
            </Text>
            <Text className="mt-0.5 text-sm text-muted">
              Digital Unity for All
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open My Profile"
            onPress={() => router.push("/profile")}
            className="h-12 w-12 items-center justify-center rounded-full border border-red-100 bg-white"
          >
            <Text className="text-base font-bold text-primary">
              {getInitials(profile?.name)}
            </Text>
          </Pressable>
        </View>

        <View className="mb-6">
          <Text className="text-2xl font-bold text-text">
            {firstName ? `Welcome back, ${firstName}!` : "Welcome back!"}
          </Text>
          <Text className="mt-2 max-w-[340px] text-base leading-6 text-muted">
            Together, we can make a difference. Every connection can save a life.
          </Text>
        </View>

        <View className="mb-8 overflow-hidden rounded-3xl bg-[#B42335] p-6">
          <View className="absolute -right-5 -top-7 h-36 w-36 rounded-full border-[18px] border-white/10" />
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-red-100">
            A community that cares
          </Text>
          <Text className="mt-3 max-w-[260px] text-3xl font-extrabold leading-9 text-white">
            Give Blood. Save Lives.
          </Text>
          <Text className="mt-2 text-base text-red-100">
            Be someone's reason to hope today.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/find-blood")}
            className="mt-6 self-start rounded-xl bg-white px-5 py-3 active:opacity-80"
          >
            <Text className="font-bold text-[#B42335]">Find Blood</Text>
          </Pressable>
        </View>

        <View className="mb-4 flex-row items-end justify-between">
          <Text className="text-xl font-bold text-text">Your community</Text>
          <Text className="text-sm text-muted">Here to help</Text>
        </View>

        <View className="mb-3 flex-row gap-3">
          <ActionCard
            icon="＋"
            title="Find Blood"
            description="Connect with nearby donors."
            onPress={() => router.push("/find-blood")}
          />
          <ActionCard
            icon="♥"
            title="Received Requests"
            description="Review requests sent to you."
            onPress={() => router.push("/received-requests")}
          />
        </View>
        <View className="flex-row gap-3">
          <ActionCard
            icon="↗"
            title="My Requests"
            description="Track requests you've sent."
            onPress={() => router.push("/my-requests")}
          />
          <ActionCard
            icon="●"
            title="My Profile"
            description="View and update your details."
            onPress={() => router.push("/profile")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
