/* eslint-disable prettier/prettier */


import { api } from "@/lib/api";

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type NotificationsResponse = {
  notifications: Notification[];
  unreadCount: number;
};

export type RevisionReminderPreference = {
  revision_reminder_enabled: boolean;
  revision_reminder_preference_set: boolean;
};

export const notificationService = {
  // -----------------------------
  // Notifications
  // -----------------------------

  async getAll(): Promise<NotificationsResponse> {
    const res = await api.get("/notifications");

    return res.data.data;
  },

  async markRead(id: string) {
    const res = await api.patch(`/notifications/${id}/read`);

    return res.data.data;
  },

  async markAllRead() {
    const res = await api.patch("/notifications/read-all");

    return res.data.data;
  },

  // -----------------------------
  // Revision reminder preference
  // -----------------------------

  async getRevisionReminderPreference(): Promise<RevisionReminderPreference> {
    const res = await api.get(
      "/notifications/revision-reminder-preference"
    );

    return res.data.data;
  },

  async setRevisionReminderPreference(enabled: boolean) {
    const res = await api.patch(
      "/notifications/revision-reminder-preference",
      {
        enabled,
      }
    );

    return res.data.data;
  },
};

export default notificationService;
