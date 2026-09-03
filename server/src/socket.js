import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import {
    registerInterviewSockets,
} from "./modules/interview/interview.socket.js";

import {
    sendInterviewMessageService,
} from "./modules/interview/interview.service.js";

let io;

export const initSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    /*
    =====================================================
    SOCKET AUTHENTICATION
    =====================================================
    */

    io.use((socket, next) => {

        try {

            const token =
                socket.handshake.auth?.token;

            console.log(
                "SOCKET AUTH TOKEN:",
                token ? "PRESENT" : "MISSING"
            );

            if (!token) {

                return next(
                    new Error("Authentication required")
                );
            }

            const decoded =
                jwt.verify(
                    token,
                    process.env.ACCESS_TOKEN_SECRET
                );

            console.log(
                "SOCKET AUTH DECODED:",
                decoded
            );

            /*
             * Your HTTP protect middleware says
             * decoded contains { id, email }
             */

            socket.userId =
                decoded.id;

            socket.user =
                decoded;

            console.log(
                "SOCKET USER ID:",
                socket.userId
            );

            next();

        } catch (err) {

            console.error(
                "SOCKET AUTH FAILED:",
                err.message
            );

            next(
                new Error(
                    "Invalid or expired token"
                )
            );
        }
    });


    /*
    =====================================================
    CONNECTION
    =====================================================
    */

    io.on("connection", (socket) => {

        console.log(
            "Socket connected:",
            socket.id
        );

        console.log(
            "Authenticated socket user:",
            socket.userId
        );


        registerInterviewSockets(socket);


        /*
        =================================================
        JOIN INTERVIEW
        =================================================
        */

        socket.on(
            "join-interview",
            async (sessionId) => {

                console.log(
                    "Joined interview:",
                    sessionId
                );

                console.log(
                    "JOIN USER ID:",
                    socket.userId
                );

                socket.join(
                    `interview-${sessionId}`
                );

                try {

                    const result =
                        await sendInterviewMessageService({

                            sessionId,

        userId:
            socket.userId,
                            message:
                                "__INTERVIEW_START__",

                            code: ""
                        });


                    getIO()
                        .to(`interview-${sessionId}`)
                        .emit(
                            "interviewer-message",
                            {
                                message:
                                    result.aiReply,

                                phase:
                                    result.phase,

                                evaluation:
                                    result.evaluation
                            }
                        );

                } catch (err) {

                    console.error(
                        "Interview start error:",
                        err
                    );

                    socket.emit(
                        "interview-error",
                        {
                            message:
                                err.message,
                        }
                    );
                }
            }
        );


        socket.on(
            "disconnect",
            () => {

                console.log(
                    "Socket disconnected:",
                    socket.id
                );

            }
        );
    });
};


export const getIO = () => {

    if (!io) {
        throw new Error(
            "Socket.io not initialized"
        );
    }

    return io;
};