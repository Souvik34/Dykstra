import express from "express";
import {
  createBroadcast,
} from "./broadcast.controller.js";

const router = express.Router();

router.post(
  "/",
  createBroadcast
);

export default router;