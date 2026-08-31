import {
    sendInterviewMessageService,
    realtimeCodeUpdateService
} from "./interview.service.js";
import {
  getIO,
} from "../../socket.js";



export const registerInterviewSockets =
  (socket) => {

    socket.on(
      "interview-message",

      async (payload) => {

        try {

          const {
            sessionId,
            message,
            code
          } = payload;



     const result =
    await sendInterviewMessageService({
        sessionId,
        message,
        code
    });

const room = getIO().to(`interview-${sessionId}`);

room.emit("interviewer-message", result);

if (result.interviewEnded) {

    room.emit("interview-ended", {
        sessionId,
    });

}

        } catch (err) {

          socket.emit(
            "interview-error",
            {
              message: err.message,
            }
          );
        }
      }
    );

 socket.on("code-update", async (payload) => {

    console.log("Backend received code-update");
    console.log(payload);

    try {

        const {
            sessionId,
            code
        } = payload;

        console.log(
            "CODE UPDATE socket.userId:",
            socket.userId
        );

        console.log(
            "CODE UPDATE sessionId:",
            sessionId
        );

        await realtimeCodeUpdateService({
            sessionId,
            userId: socket.userId,
            code
        });

    } catch (err) {

        console.error("Code update error:", err);

        socket.emit(
            "interview-error",
            {
                message: err.message
            }
        );
    }
});
};