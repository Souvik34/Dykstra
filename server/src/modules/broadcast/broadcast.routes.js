import express from "express";

import {
  createBroadcast,
} from "./broadcast.controller.js";

import { protect } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  requireAdmin,
  createBroadcast
);

export default router;