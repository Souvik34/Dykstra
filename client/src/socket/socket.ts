/* eslint-disable prettier/prettier */
import { io } from "socket.io-client";


   export const socket = io(
    "https://api.dykstra.in",
    {
        autoConnect: false,
        transports: ["websocket"],
    }
);