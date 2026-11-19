import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useNotifications } from "@/context/NotificationContext";
import type { NotificationRecord, NotificationType } from "@/api/notifications";

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case "DONATION_REQUEST":
      return "🩸";
    case "REQUEST_ACCEPTED":
      return "✅";
    case "REQUEST_REJECTED":
      return "❌";
    case "REQUEST_CANCELLED":
      return "⚠️";
    case "REQUEST_FULFILLED":
      return "🎉";
    case "ACCOUNT_SECURITY":
      return "🔒";
    case "PLATFORM_ANNOUNCEMENT":
      return "📢";
    default:
      return "🔔";
  }
};

const getNotificationTargetRoute = (notification: NotificationRecord): string => {
  switch (notification.type) {
    case "DONATION_REQUEST":
      return "/received-requests";
    case "REQUEST_ACCEPTED":
    case "REQUEST_REJECTED":
    case "REQUEST_CANCELLED":
    case "REQUEST_FULFILLED":
      return "/my-requests";
    case "ACCOUNT_SECURITY":
      return "/profile";
    default:
      return "/home";
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleNotificationPress = async (item: NotificationRecord) => {
    if (!item.isRead) {
      await markAsRead(item.id);
    }
    const route = getNotificationTargetRoute(item);
    router.push(route as any);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteNotification(id);
    } finally {
      setDeletingId(null);
    }
  };

  const renderItem = ({ item }: { item: NotificationRecord }) => {
    const isDeleting = deletingId === item.id;

    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => handleNotificationPress(item)}
        className={`mb-3 flex-row rounded-2xl border p-4 active:opacity-75 ${
          item.isRead
            ? "border-gray-200 bg-white"
            : "border-red-200 bg-[#FFF8F8]"
        }`}
      >
        {/* Type Icon Badge */}
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-gray-100">
          <Text className="text-xl">{getNotificationIcon(item.type)}</Text>
        </View>

        {/* Content */}
        <View className="flex-1 pr-2">
          <View className="flex-row items-center justify-between">
            <Text
              className={`text-base font-semibold ${
                item.isRead ? "text-gray-900" : "text-[#B42335]"
              }`}
            >
              {item.title}
            </Text>
            {!item.isRead && (
              <View className="h-2.5 w-2.5 rounded-full bg-[#B42335]" />
            )}
          </View>

          <Text className="mt-1 text-sm leading-5 text-gray-600">
            {item.message}
          </Text>

          <View className="mt-2.5 flex-row items-center justify-between">
            <Text className="text-xs text-gray-400">
              {formatTimeAgo(item.createdAt)}
            </Text>

            {/* Actions: Delete */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete notification"
              onPress={(e) => {
                e.stopPropagation?.();
                handleDelete(item.id);
              }}
              disabled={isDeleting}
              className="px-2 py-1"
            >
              <Text className="text-xs font-semibold text-gray-400 active:text-red-600">
                {isDeleting ? "..." : "Delete"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 active:opacity-70"
          >
            <Text className="text-lg font-bold text-gray-700">←</Text>
          </Pressable>
          <View>
            <Text className="text-xl font-bold text-gray-900">Notifications</Text>
            {unreadCount > 0 && (
              <Text className="text-xs font-medium text-[#B42335]">
                {unreadCount} unread
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {unreadCount > 0 && (
            <Pressable
              accessibilityRole="button"
              onPress={() => markAllAsRead()}
              className="rounded-full bg-red-50 px-3 py-1.5 active:opacity-70"
            >
              <Text className="text-xs font-bold text-[#B42335]">
                Mark all read
              </Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Preferences"
            onPress={() => router.push("/notification-preferences")}
            className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:opacity-70"
          >
            <Text className="text-sm">⚙️</Text>
          </Pressable>
        </View>
      </View>

      {/* Body */}
      {isLoading && notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#B42335" />
          <Text className="mt-3 text-sm text-gray-500">
            Loading notifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerClassName="px-4 py-4"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshNotifications}
              colors={["#B42335"]}
            />
          }
          ListEmptyComponent={
            <View className="mt-20 items-center justify-center px-6 text-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <Text className="text-3xl">📭</Text>
              </View>
              <Text className="text-lg font-bold text-gray-800">
                No notifications yet
              </Text>
              <Text className="mt-1 text-center text-sm text-gray-500">
                When you receive blood requests or status updates, they will
                appear here in real time.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
