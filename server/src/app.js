import express from "express";
import cors from "cors";
import { connectRedis } from "./config/redis.js";
const app = express();
import "./workers/solve.worker.js";
import "./workers/revisionReminder.worker.js";
import "./schedulers/revisionReminder.scheduler.js";
await connectRedis();
app.use(
  cors({
    origin: [
      "https://dykstra.in",
      "https://www.dykstra.in",
    ],
    credentials: true,
  })
);

app.use(express.json());

import cookieParser from "cookie-parser";
app.use(cookieParser());

import passport from "./config/passport.js";
app.use(passport.initialize());

import authRoutes from "./modules/auth/auth.route.js";
app.use("/api/v1/auth", authRoutes);

import problemRoutes from "./modules/problems/problems.route.js";
app.use("/api/v1/problems", problemRoutes);

import revisionRoutes from "./modules/revision/revision.route.js";
app.use("/api/v1/revision", revisionRoutes);

import progressRoutes from "./modules/progress/progress.route.js";
app.use("/api/v1/progress", progressRoutes);

import dashboardRoutes from "./modules/dashboard/dashboard.route.js";
app.use("/api/v1/dashboard", dashboardRoutes);

import mentorRoutes from "./modules/mentor/mentor.route.js";
app.use("/api/v1/mentor",mentorRoutes);

import leetcodeRoutes from "./modules/integrations/leetcode/leetcode.route.js";
app.use("/api/v1/leetcode", leetcodeRoutes);

import aiRoutes from "./modules/ai/ai.route.js";
app.use("/api/v1/ai", aiRoutes);

import interviewRoutes from "./modules/interview/interview.route.js";

app.use("/api/v1/interview", interviewRoutes);

import feedbackRoutes from "./modules/auth/feedback/feedback.routes.js";
app.use("/api/v1/feedback", feedbackRoutes);

import notificationRoutes from "./modules/notification/notification.routes.js";
app.use("/api/v1/notifications", notificationRoutes);

import broadcastRoutes from "./modules/broadcast/broadcast.routes.js";
app.use("/api/v1/broadcast", broadcastRoutes);

export default app;
