import { Router } from "express";

import {
    getNotificationsController,
    markNotificationReadController,
    markAllNotificationsReadController,
    getRevisionReminderPreferenceController,
    updateRevisionReminderPreferenceController,
} from "./notification.controller.js";

import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", protect, getNotificationsController);

router.patch(
  "/read-all",
  protect,
  markAllNotificationsReadController
);
router.get(
    "/revision-reminder-preference",
    protect,
    getRevisionReminderPreferenceController
);

router.patch(
    "/revision-reminder-preference",
    protect,
    updateRevisionReminderPreferenceController
);
router.patch(
  "/:id/read",
  protect,
  markNotificationReadController
);

export default router;