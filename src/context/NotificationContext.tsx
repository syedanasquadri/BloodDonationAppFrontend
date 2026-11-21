import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Platform } from "react-native";
import { io, Socket } from "socket.io-client";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { API_URL } from "@/api/config";
import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/lib/token-storage";
import { registerForPushNotificationsAsync } from "@/lib/push-notifications";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as apiDeleteNotification,
  registerPushToken,
  removePushToken,
  NotificationRecord,
} from "@/api/notifications";

interface NotificationContextType {
  notifications: NotificationRecord[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  expoPushToken: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const tokenRef = useRef<string | null>(null);

  // Fetch initial notifications and unread count
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [listResult, count] = await Promise.all([
        getNotifications({ limit: 30 }),
        getUnreadNotificationCount(),
      ]);
      setNotifications(listResult.notifications);
      setUnreadCount(count);
    } catch (error) {
      console.warn("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [listResult, count] = await Promise.all([
        getNotifications({ limit: 30 }),
        getUnreadNotificationCount(),
      ]);
      setNotifications(listResult.notifications);
      setUnreadCount(count);
    } catch (error) {
      console.warn("Failed to refresh notifications:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await markNotificationAsRead(id);
    } catch (error) {
      console.warn(`Failed to mark notification ${id} as read:`, error);
      // Revert if needed by refreshing
      refreshNotifications();
    }
  }, [refreshNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await markAllNotificationsAsRead();
    } catch (error) {
      console.warn("Failed to mark all as read:", error);
      refreshNotifications();
    }
  }, [refreshNotifications]);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === id);
        if (target && !target.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== id);
      });

      await apiDeleteNotification(id);
    } catch (error) {
      console.warn(`Failed to delete notification ${id}:`, error);
      refreshNotifications();
    }
  }, [refreshNotifications]);

  // Handle deep linking from notification interaction
  const handleNotificationNavigation = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      if (data && typeof data.link === "string" && data.link.startsWith("/")) {
        try {
          router.push(data.link as any);
        } catch (err) {
          console.warn("Navigation from notification failed:", err);
        }
      }
    },
    [router],
  );

  // Push notifications registration & lifecycle
  useEffect(() => {
    if (!isAuthenticated) {
      // User logged out: clean up push token if registered
      if (tokenRef.current) {
        removePushToken(tokenRef.current).catch(() => {});
        tokenRef.current = null;
        setExpoPushToken(null);
      }
      return;
    }

    if (Platform.OS === "web") {
      return;
    }

    let isMounted = true;

    // 1. Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (!isMounted || !token) return;

      tokenRef.current = token;
      setExpoPushToken(token);

      registerPushToken(token, Platform.OS).catch((err) => {
        console.warn("Failed to register push token with backend:", err);
      });
    });

    // 2. Check for cold-start notification click
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (isMounted && response) {
        handleNotificationNavigation(response);
      }
    });

    // 3. Foreground notification listener
    const notificationListener =
      Notifications.addNotificationReceivedListener((notification) => {
        // Foreground banner is handled by Notifications.setNotificationHandler
        // Refresh unread count in state
        getUnreadNotificationCount()
          .then((count) => {
            if (isMounted) setUnreadCount(count);
          })
          .catch(() => {});
      });

    // 4. Background/app-opened notification response listener
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotificationNavigation(response);
      });

    return () => {
      isMounted = false;
      notificationListener.remove();
      responseListener.remove();
    };
  }, [isAuthenticated, handleNotificationNavigation]);

  // Socket.IO lifecycle
  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    let isMounted = true;
    loadNotifications();

    const setupSocket = async () => {
      const token = await getAccessToken();
      if (!isMounted || !token || !API_URL) return;

      // Disconnect existing socket to prevent duplicates
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      const socket = io(API_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      socket.on("connect", () => {
        // Connected to user room
      });

      // Listen for incoming new notification
      socket.on(
        "notification:new",
        (payload: { notification: NotificationRecord; unreadCount: number }) => {
          if (!isMounted) return;

          setNotifications((prev) => {
            // Avoid duplicate in state
            if (prev.some((n) => n.id === payload.notification.id)) {
              return prev;
            }
            return [payload.notification, ...prev];
          });

          if (typeof payload.unreadCount === "number") {
            setUnreadCount(payload.unreadCount);
          } else {
            setUnreadCount((c) => c + 1);
          }
        },
      );

      // Listen for unread count updates
      socket.on(
        "notification:unread_count",
        (payload: { unreadCount: number }) => {
          if (isMounted && typeof payload.unreadCount === "number") {
            setUnreadCount(payload.unreadCount);
          }
        },
      );

      socket.on("connect_error", async (error) => {
        console.warn("[Socket.IO] Connection error:", error.message);

        // If access token expired, trigger token refresh via apiClient and reconnect
        if (
          error.message.includes("jwt expired") ||
          error.message.includes("Authentication error") ||
          error.message.includes("Invalid token")
        ) {
          try {
            await getUnreadNotificationCount();
            const freshToken = await getAccessToken();
            if (freshToken && socketRef.current) {
              socketRef.current.auth = { token: freshToken };
              socketRef.current.connect();
            }
          } catch (refreshErr) {
            console.warn("[Socket.IO] Re-authentication failed:", refreshErr);
          }
        }
      });

      socketRef.current = socket;
    };

    const initialize = async () => {
      await loadNotifications();
      if (isMounted) {
        await setupSocket();
      }
    };

    initialize();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, loadNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isRefreshing,
        expoPushToken,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
