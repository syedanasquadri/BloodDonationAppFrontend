import { apiClient } from "@/api/client";

export type NotificationType =
  | "DONATION_REQUEST"
  | "REQUEST_ACCEPTED"
  | "REQUEST_REJECTED"
  | "REQUEST_CANCELLED"
  | "REQUEST_FULFILLED"
  | "REQUEST_EXPIRED"
  | "ACCOUNT_SECURITY"
  | "PLATFORM_ANNOUNCEMENT";

export interface NotificationRecord {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string | null;
  entityId: number | null;
  data: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationRecord[];
  total: number;
}

export interface NotificationPreferences {
  bloodRequests: boolean;
  statusUpdates: boolean;
  announcements: boolean;
}

export const getNotifications = async (
  params?: {
    limit?: number;
    offset?: number;
    isRead?: boolean;
  },
  signal?: AbortSignal,
): Promise<NotificationListResponse> => {
  const response = await apiClient.get<NotificationListResponse>(
    "/api/notifications",
    {
      params,
      signal,
    },
  );
  return response.data;
};

export const getUnreadNotificationCount = async (
  signal?: AbortSignal,
): Promise<number> => {
  const response = await apiClient.get<{ unreadCount: number }>(
    "/api/notifications/unread-count",
    { signal },
  );
  return response.data.unreadCount;
};

export const markNotificationAsRead = async (
  id: number,
): Promise<NotificationRecord> => {
  const response = await apiClient.patch<NotificationRecord>(
    `/api/notifications/${id}/read`,
  );
  return response.data;
};

export const markAllNotificationsAsRead = async (): Promise<number> => {
  const response = await apiClient.patch<{ message: string; count: number }>(
    "/api/notifications/mark-all-read",
  );
  return response.data.count;
};

export const deleteNotification = async (id: number): Promise<boolean> => {
  const response = await apiClient.delete<{ message: string }>(
    `/api/notifications/${id}`,
  );
  return response.status === 200;
};

export const registerPushToken = async (
  token: string,
  deviceType?: string,
): Promise<void> => {
  await apiClient.post("/api/notifications/push-token", {
    token,
    deviceType,
  });
};

export const removePushToken = async (token: string): Promise<void> => {
  await apiClient.delete("/api/notifications/push-token", {
    data: { token },
  });
};

export const getNotificationPreferences = async (
  signal?: AbortSignal,
): Promise<NotificationPreferences> => {
  const response = await apiClient.get<NotificationPreferences>(
    "/api/notifications/preferences",
    { signal },
  );
  return response.data;
};

export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> => {
  const response = await apiClient.patch<NotificationPreferences>(
    "/api/notifications/preferences",
    preferences,
  );
  return response.data;
};
