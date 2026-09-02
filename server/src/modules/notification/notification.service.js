import {
  createNotificationRepo,
  getAllUsersForBroadcastRepo,
  getPendingRevisionUsersRepo,
  hasRevisionReminderTodayRepo,
  logRevisionReminderRepo,
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