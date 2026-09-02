import {
  createBroadcastRepo,
} from "../notification/notification.repository.js";

import {
  createBroadcastNotificationsService,
} from "../notification/notification.service.js";


export const createBroadcastService = async ({
  title,
  message,
  sendEmail,
  createdBy,
}) => {

  if (!title || !message) {
    throw new Error(
      "Title and message are required"
    );
  }

  const broadcast =
    await createBroadcastRepo({
      title,
      message,
      sendEmail,
      createdBy,
    });

  const notificationResult =
    await createBroadcastNotificationsService({
      title,
      message,
    });

  return {
    broadcast,
    usersNotified:
      notificationResult.usersNotified,
  };
};