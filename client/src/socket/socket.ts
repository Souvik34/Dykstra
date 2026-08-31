/* eslint-disable prettier/prettier */
import { io } from "socket.io-client";

export const socket = io(
    "https://api.dykstra.in",
    {
        autoConnect: false,

        transports: ["websocket"],

        auth: (cb) => {

            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("auth_token")
                    : null;

            cb({
                token
            });
        }
    }
);