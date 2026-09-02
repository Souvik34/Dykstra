import express from "express";

import {
  createBroadcast,
} from "./broadcast.controller.js";

import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createBroadcast
);

export default router;