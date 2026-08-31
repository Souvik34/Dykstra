/* eslint-disable prettier/prettier */
import {
    createContext,
    useContext,
    useEffect,
    ReactNode,
} from "react";

import { socket } from "./socket";

interface Props {
    children: ReactNode;
}

interface InterviewSocketContextType {

    joinInterview:
        (sessionId: string) => Promise<void>;

    leaveInterview:
        () => void;
}

const InterviewSocketContext =
    createContext<InterviewSocketContextType | null>(
        null
    );


export function InterviewSocketProvider({
    children,
}: Props) {

    useEffect(() => {

        const handleConnect = () => {

            console.log(
                "Connected:",
                socket.id
            );

        };

        const handleDisconnect = () => {

            console.log(
                "Disconnected"
            );

        };

        const handleConnectError = (
            error: Error
        ) => {

            console.error(
                "Socket connection error:",
                error.message
            );

        };


        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "disconnect",
            handleDisconnect
        );

        socket.on(
            "connect_error",
            handleConnectError
        );


        return () => {

            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "disconnect",
                handleDisconnect
            );

            socket.off(
                "connect_error",
                handleConnectError
            );

            socket.disconnect();

        };

    }, []);


 const joinInterview = async (sessionId: string) => {

    const token =
        localStorage.getItem("auth_token");

    console.log(
        "JOIN INTERVIEW TOKEN:",
        token ? "PRESENT" : "MISSING"
    );

    if (!token) {
        throw new Error("No authentication token found");
    }

    socket.auth = {
        token
    };

    if (!socket.connected) {

        await new Promise<void>((resolve, reject) => {

            const onConnect = () => {
                cleanup();
                resolve();
            };

            const onError = (error: Error) => {
                cleanup();
                reject(error);
            };

            const cleanup = () => {
                socket.off("connect", onConnect);
                socket.off("connect_error", onError);
            };

            socket.once("connect", onConnect);
            socket.once("connect_error", onError);

            socket.connect();
        });
    }

    console.log(
        "EMITTING join-interview:",
        sessionId
    );

    socket.emit(
        "join-interview",
        sessionId
    );
};

    const leaveInterview = () => {

        socket.disconnect();

    };


    return (
        <InterviewSocketContext.Provider
            value={{
                joinInterview,
                leaveInterview,
            }}
        >
            {children}
        </InterviewSocketContext.Provider>
    );
}


export const useInterviewSocket = () => {

    return useContext(
        InterviewSocketContext
    );

};