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


    const joinInterview =
        async (sessionId: string) => {

            /*
            Make sure the socket uses the
            latest JWT.
            */

            const token =
                localStorage.getItem(
                    "auth_token"
                );

            console.log(
                "JOIN INTERVIEW TOKEN:",
                token
                    ? "PRESENT"
                    : "MISSING"
            );


            socket.auth = {
                token
            };


            /*
            If socket isn't connected,
            connect it first.
            */

            if (!socket.connected) {

                await new Promise<void>(
                    (resolve, reject) => {

                        const handleConnect = () => {

                            cleanup();

                            resolve();

                        };

                        const handleError =
                            (error: Error) => {

                                cleanup();

                                reject(error);

                            };

                        const cleanup = () => {

                            socket.off(
                                "connect",
                                handleConnect
                            );

                            socket.off(
                                "connect_error",
                                handleError
                            );

                        };


                        socket.once(
                            "connect",
                            handleConnect
                        );

                        socket.once(
                            "connect_error",
                            handleError
                        );

                        socket.connect();

                    }
                );
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