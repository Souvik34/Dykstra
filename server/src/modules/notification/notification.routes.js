import { Router } from "express";

import {
    getNotificationsController,
    markNotificationReadController,
    markAllNotificationsReadController,
} from "./notification.controller.js";

import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getNotificationsController);

router.patch(
    "/read-all",
    requireAuth,
    markAllNotificationsReadController
);

router.patch(
    "/:id/read",
    requireAuth,
    markNotificationReadController
);

export default router;