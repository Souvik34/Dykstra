import { revisionReminderQueue } from "../queues/revisionReminder.queue.js";

await revisionReminderQueue.upsertJobScheduler(
  "daily-revision-reminder",
  {
    pattern: "0 9 * * *",
  },
  {
    name: "daily-revision-reminder",
    data: {},
  }
);

console.log("Revision reminder scheduler registered");