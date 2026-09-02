import { Router } from "express";

import {
    getNotificationsController,
    markNotificationReadController,
    markAllNotificationsReadController,
} from "./notification.controller.js";

import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", protect, getNotificationsController);

router.patch(
  "/read-all",
  protect,
  markAllNotificationsReadController
);

router.patch(
  "/:id/read",
  protect,
  markNotificationReadController
);

export default router;