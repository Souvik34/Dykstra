import {
  getNotificationsRepo,
  markNotificationReadRepo,
  markAllNotificationsReadRepo,
  getUnreadNotificationCountRepo,
  createNotificationRepo,
  getAllUsersForBroadcastRepo,
  getPendingRevisionUsersRepo,
  hasRevisionReminderTodayRepo,
  logRevisionReminderRepo,
  getRevisionReminderPreferenceRepo,
  updateRevisionReminderPreferenceRepo,
} from "./notification.repository.js";

import {
  sendRevisionReminderEmail,
} from "../../utils/email.utils.js";


export const createBroadcastNotificationsService = async ({
  title,
  message,
}) => {
  const users = await getAllUsersForBroadcastRepo();

  for (const user of users) {
    await createNotificationRepo({
      userId: user.id,
      type: "BROADCAST",
      title,
      message,
    });
  }

  return {
    usersNotified: users.length,
  };
};
export const getNotificationsService = async (userId) => {
  const notifications = await getNotificationsRepo(userId);
  const unreadCount = await getUnreadNotificationCountRepo(userId);

  return {
    notifications,
    unreadCount,
  };
};

export const markNotificationReadService = async (
  userId,
  notificationId
) => {
  return await markNotificationReadRepo(
    userId,
    notificationId
  );
};

export const markAllNotificationsReadService = async (userId) => {
  return await markAllNotificationsReadRepo(userId);
};

export const sendRevisionRemindersService = async () => {
  const users =
    await getPendingRevisionUsersRepo();

  let sent = 0;

  for (const user of users) {
    const alreadySent =
      await hasRevisionReminderTodayRepo(user.id);

    if (alreadySent) {
      continue;
    }

    await sendRevisionReminderEmail({
      to: user.email,
      name: user.name,
      pendingCount: user.pending_count,
    });

    await logRevisionReminderRepo({
      userId: user.id,
      pendingCount: user.pending_count,
    });

    sent++;
  }

  return {
    candidates: users.length,
    sent,
  };
};

export const getRevisionReminderPreferenceService = async (userId) => {
  return await getRevisionReminderPreferenceRepo(userId);
};

export const updateRevisionReminderPreferenceService = async (
  userId,
  enabled
) => {
  return await updateRevisionReminderPreferenceRepo(userId, enabled);
};