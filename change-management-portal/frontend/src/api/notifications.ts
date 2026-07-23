import { apiClient } from "./client";
import type { Notification } from "../types";

export async function listNotifications(unreadOnly = false) {
  const { data } = await apiClient.get<Notification[]>("/notifications", {
    params: unreadOnly ? { unread: "true" } : undefined,
  });
  return data;
}

export async function markNotificationRead(id: string) {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await apiClient.post("/notifications/read-all");
}
