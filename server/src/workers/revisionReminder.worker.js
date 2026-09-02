import { Worker } from "bullmq";
import { connection } from "../config/bullmq.redis.js";

import {
  sendRevisionRemindersService,
} from "../modules/notification/notification.service.js";


export const revisionReminderWorker =
  new Worker(
    "revision-reminder",
    async (job) => {

      console.log(
        "Processing revision reminder job:",
        job.id
      );

      const result =
        await sendRevisionRemindersService();

      console.log(
        "Revision reminder result:",
        result
      );

      return result;
    },
    {
      connection,
      concurrency: 1,
    }
  );


revisionReminderWorker.on(
  "completed",
  (job) => {
    console.log(
      `Revision reminder job ${job.id} completed`
    );
  }
);


revisionReminderWorker.on(
  "failed",
  (job, err) => {
    console.error(
      `Revision reminder job ${job?.id} failed:`,
      err.message
    );
  }
);