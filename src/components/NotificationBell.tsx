import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useNotifications } from "@/context/NotificationContext";

export function NotificationBell({
  tintColor = "#B42335",
}: {
  tintColor?: string;
}) {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Notifications, ${unreadCount} unread`}
      onPress={() => router.push("/notifications")}
      className="relative h-12 w-12 items-center justify-center rounded-full border border-red-100 bg-white active:opacity-75"
    >
      {/* Bell Icon rendered cleanly */}
      <Text style={{ fontSize: 20 }}>🔔</Text>

      {unreadCount > 0 && (
        <View className="absolute -right-1 -top-1 min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#B42335] px-1.5 border-2 border-white">
          <Text className="text-[11px] font-bold text-white leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
