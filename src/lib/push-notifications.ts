import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants, { ExecutionEnvironment } from "expo-constants";

// Configure how notifications appear when app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

/**
 * Checks whether the app is running inside the Expo Go sandbox client.
 * Expo Go on Android removed remote push notification support in SDK 53+.
 */
export const isRunningInExpoGo = (): boolean => {
  return (
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    (Constants as any).appOwnership === "expo"
  );
};

/**
 * Sets up Android notification channels, requests user permissions,
 * and retrieves the ExpoPushToken.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === "web") {
    return null;
  }

  // Remote push notifications in Expo Go on Android were discontinued by Expo in SDK 53+
  // due to Google's migration to FCM HTTP v1. Standalone / development builds support it.
  if (Platform.OS === "android" && isRunningInExpoGo()) {
    console.info(
      "[PushNotifications] Expo Go on Android does not support remote push notifications (SDK 53+). Real-time alerts are delivered via Socket.IO. Use a development build for standalone push.",
    );
    return null;
  }

  let token: string | null = null;

  try {
    if (Platform.OS === "android") {
      try {
        await Notifications.setNotificationChannelAsync("default", {
          name: "General Notifications",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#B42335",
          sound: "default",
          enableVibrate: true,
        });
      } catch (channelError) {
        console.warn("Could not configure notification channel:", channelError);
      }
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Permission for push notifications not granted.");
        return null;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      const pushTokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );
      token = pushTokenData.data;
    } else {
      console.info("Physical device required for remote push tokens.");
    }
  } catch (error) {
    console.warn("Error during push notification registration:", error);
  }

  return token;
}
