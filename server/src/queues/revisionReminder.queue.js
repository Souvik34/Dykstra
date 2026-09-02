import { Queue } from "bullmq";
import { connection } from "../config/bullmq.redis.js";

export const revisionReminderQueue = new Queue(
  "revision-reminder",
  {
    connection,
  }
);