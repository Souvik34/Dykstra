/* eslint-disable prettier/prettier */

import { useEffect, useRef, useState, useCallback } from "react";
import interviewService from "@/services/interviewService";
import { useNavigate } from "@tanstack/react-router";
import { useInterviewSocket } from "../../socket/interviewSocketProvider";
import { socket } from "@/socket/socket";
import {
  Bot,
  UserRound,
  Send,
  Clock3,
  Sparkles,
  Circle,
  Wifi,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SupportedLanguageId } from "@/features/editor/code-editor";

interface Message {
  role: "INTERVIEWER" | "CANDIDATE";
  content: string;
}

interface Props {
  sessionId: string;
  language: SupportedLanguageId;
  code: string;
}

type InterviewPhase =
  | "INTRODUCTION"
  | "UNDERSTANDING"
  | "CODING"
  | "OPTIMIZATION"
  | "FEEDBACK"
  | "FINISHED";

export default function AIInterviewerPanel({
  sessionId,
  language,
  code,
}: Props) {
  const [phase, setPhase] =
    useState<InterviewPhase>("INTRODUCTION");

  const [time, setTime] = useState(45 * 60);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [typingMessage, setTypingMessage] =
    useState("");

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [showIdleModal, setShowIdleModal] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const interviewStartedRef =
    useRef(false);

  const [interviewAccessChecked, setInterviewAccessChecked] =
    useState(false);

  const interviewSocket =
    useInterviewSocket();

  const navigate = useNavigate();

  /*
   * Join interview room
   */
  useEffect(() => {
    if (!interviewSocket || !sessionId) return;

    interviewSocket.joinInterview(sessionId);

    return () => {
      interviewSocket.leaveInterview();
    };
  }, [sessionId, interviewSocket]);

  /*
   * Load interview state
   */
  useEffect(() => {
    if (!sessionId) return;

    const loadInterview = async () => {
      try {
        const res =
          await interviewService.getInterviewState(
            sessionId
          );

        const data =
          res?.data?.data ??
          res?.data ??
          res;

        setInterviewAccessChecked(true);

        if (data.session?.phase) {
          setPhase(data.session.phase);
        }

        if (data?.aiReply) {
          await addAIMessageSafely(data.aiReply);
        }

        if (data.firstQuestion) {
          console.log(
            "FIRST QUESTION:",
            data.firstQuestion
          );
        }
      } catch (err: any) {
        console.error(
          "Failed to load interview:",
          err
        );

        if (
          err?.response?.status === 409 &&
          err?.response?.data?.code ===
            "INTERVIEW_ALREADY_COMPLETED"
        ) {
          await navigate({
            to: "/interview/$sessionId/report",
            params: {
              sessionId,
            },
          });

          return;
        }

        setInterviewAccessChecked(false);
      }
    };

    loadInterview();
  }, [sessionId, navigate]);

  /*
   * Receive AI interviewer messages
   */
  useEffect(() => {
    const handleAIResponse = async (data: any) => {
      console.log(
        "INTERVIEWER SOCKET MESSAGE:",
        data
      );

      if (data.phase) {
        setPhase(data.phase);
      }

      const text =
        data.aiReply ??
        data.message ??
        "";

      if (!text) {
        return;
      }

      await addAIMessageSafely(text);

      if (data.phase === "FINISHED") {
        try {
          await interviewService.endInterview(
            sessionId
          );

          await navigate({
            to: "/interview/$sessionId/report",
            params: {
              sessionId,
            },
          });
        } catch (err) {
          console.error(
            "Failed to open interview report:",
            err
          );
        }
      }
    };

    socket.on(
      "interviewer-message",
      handleAIResponse
    );

    return () => {
      socket.off(
        "interviewer-message",
        handleAIResponse
      );
    };
  }, [sessionId, navigate]);

  /*
   * Start interview
   */
  useEffect(() => {
    if (!sessionId) return;
    if (!interviewSocket) return;
    if (!interviewAccessChecked) return;
    if (interviewStartedRef.current) return;

    const startInterview = async () => {
      if (interviewStartedRef.current) {
        return;
      }

      interviewStartedRef.current = true;

      try {
        const response =
          await interviewService.submitAIResponse(
            sessionId,
            {
              message:
                "__INTERVIEW_START__",
              code: "",
              isSubmission: false,
            }
          );

        const data =
          response?.data?.data ??
          response?.data ??
          response;

        if (data?.aiReply) {
          await addAIMessageSafely(
            data.aiReply
          );
        }

        if (data?.phase) {
          setPhase(data.phase);
        }
      } catch (err) {
        console.error(
          "Failed to start interviewer:",
          err
        );

        interviewStartedRef.current =
          false;
      }
    };

    if (socket.connected) {
      startInterview();
    } else {
      socket.once(
        "connect",
        startInterview
      );
    }

    return () => {
      socket.off(
        "connect",
        startInterview
      );
    };
  }, [
    sessionId,
    interviewSocket,
    interviewAccessChecked,
  ]);

  /*
   * Interview timer
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 0) {
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /*
   * Auto scroll
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typingMessage]);

  /*
   * Interview ended
   */
  useEffect(() => {
    const handleInterviewEnded = () => {
      setTimeout(() => {
        navigate({
          to: "/interview/$sessionId/report",
          params: {
            sessionId,
          },
        });
      }, 2000);
    };

    socket.on(
      "interview-ended",
      handleInterviewEnded
    );

    return () => {
      socket.off(
        "interview-ended",
        handleInterviewEnded
      );
    };
  }, [sessionId, navigate]);

  /*
   * Idle detection
   */
  useEffect(() => {
    const handleInterviewIdle = () => {
      setShowIdleModal(true);
    };

    socket.on(
      "interview-idle",
      handleInterviewIdle
    );

    return () => {
      socket.off(
        "interview-idle",
        handleInterviewIdle
      );
    };
  }, []);

  /*
   * Send code changes
   */
  useEffect(() => {
    if (!sessionId) return;
    if (!code.trim()) return;

   const timer = setTimeout(() => {
  console.log("🚀 CODE UPDATE EMITTING", {
    sessionId,
    codeLength: code.length,
    codePreview: code.slice(-100),
    socketConnected: socket.connected,
  });

  socket.emit("code-update", {
    sessionId,
    code,
  });
}, 2000);

    return () => clearTimeout(timer);
  }, [code, sessionId]);

  /*
   * AI typing
   */
  const addAIMessageSafely = useCallback(
    async (text: string) => {
      if (!text?.trim()) {
        return;
      }

      const normalizedText =
        text.trim();

      const alreadyExists =
        messages.some(
          (message) =>
            message.role ===
              "INTERVIEWER" &&
            message.content.trim() ===
              normalizedText
        );

      if (alreadyExists) {
        return;
      }

      setTypingMessage("");

      let output = "";

      for (const char of normalizedText) {
        output += char;

        setTypingMessage(output);

        await new Promise((resolve) =>
          setTimeout(resolve, 18)
        );
      }

      setMessages((prev) => {
        const duplicate =
          prev.some(
            (message) =>
              message.role ===
                "INTERVIEWER" &&
              message.content.trim() ===
                normalizedText
          );

        if (duplicate) {
          return prev;
        }

        return [
          ...prev,
          {
            role: "INTERVIEWER",
            content: normalizedText,
          },
        ];
      });

      setTypingMessage("");
    },
    [messages]
  );

  /*
   * Send candidate message
   */
  const sendMessage = async () => {
    const userMessage =
      input.trim();

    if (!userMessage || loading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "CANDIDATE",
        content: userMessage,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      await interviewService.submitAIResponse(
        sessionId,
        {
          message: userMessage,
          code,
          isSubmission: false,
        }
      );
    } catch (err) {
      console.error(
        "Failed to send interview response:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Keyboard handling
   */
  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (
    seconds: number
  ) => {
    const min = Math.floor(
      seconds / 60
    );

    const sec = seconds % 60;

    return `${min}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  const phaseLabel = phase
    .replace("_", " ")
    .toLowerCase()
    .replace(/^\w/, (c) =>
      c.toUpperCase()
    );

  const isLowTime = time <= 5 * 60;

  return (
    <aside className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#07070a] text-white">

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-violet-600/[0.07] blur-[110px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute -bottom-40 -left-32 h-72 w-72 rounded-full bg-blue-500/[0.045] blur-[110px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div
          className="
            absolute inset-0
            opacity-[0.018]
            [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
            [background-size:32px_32px]
          "
        />
      </div>

      {/* =====================================================
          IDLE MODAL
      ===================================================== */}

      <AnimatePresence>
        {showIdleModal && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              absolute
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/70
              px-5
              backdrop-blur-md
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 18,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.98,
              }}
              transition={{
                duration: 0.3,
              }}
              className="
                relative
                w-full
                max-w-sm
                overflow-hidden
                rounded-3xl
                border
                border-white/[0.09]
                bg-[#0d0d11]
                p-6
                shadow-2xl
                shadow-black/60
              "
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-violet-500/15 blur-3xl" />

              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                  }}
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-violet-500/20
                    bg-violet-500/10
                  "
                >
                  <MessageSquare
                    size={20}
                    className="text-violet-400"
                  />
                </motion.div>

                <h2 className="mt-5 text-xl font-semibold tracking-tight text-white">
                  Still working?
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  You haven't made any progress
                  for a while. Are you still
                  working on the problem?
                </p>

                <motion.button
                  whileHover={{
                    y: -1,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={() =>
                    setShowIdleModal(false)
                  }
                  className="
                    mt-6
                    w-full
                    rounded-xl
                    bg-violet-600
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-white
                    shadow-lg
                    shadow-violet-600/20
                    transition
                    hover:bg-violet-500
                  "
                >
                  Yes, I'm working
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#09090d]/80 px-4 py-3.5 backdrop-blur-xl">

        <div className="flex min-w-0 items-center gap-3">

          {/* AI presence */}

          <div className="relative">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(139,92,246,0.0)",
                  "0 0 0 5px rgba(139,92,246,0.08)",
                  "0 0 0 0 rgba(139,92,246,0.0)",
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-violet-500/20
                bg-violet-500/10
              "
            >
              <Bot
                size={17}
                className="text-violet-400"
              />
            </motion.div>

            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-[#09090d] bg-emerald-400">
              <span className="h-1 w-1 rounded-full bg-white" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold tracking-tight text-white">
                AI Interviewer
              </p>

              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                <Circle
                  size={6}
                  fill="currentColor"
                />
                LIVE
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md border border-violet-500/15 bg-violet-500/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-violet-300">
                {phaseLabel}
              </span>

           
            </div>
          </div>
        </div>

        {/* Timer */}

        <motion.div
          animate={
            isLowTime
              ? {
                  borderColor: [
                    "rgba(244,63,94,0.15)",
                    "rgba(244,63,94,0.45)",
                    "rgba(244,63,94,0.15)",
                  ],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          className={`
            ml-3
            flex
            shrink-0
            items-center
            gap-2
            rounded-xl
            border
            px-3
            py-2
            text-xs
            font-semibold
            tabular-nums
            backdrop-blur-sm
            ${
              isLowTime
                ? "border-rose-500/20 bg-rose-500/[0.07] text-rose-300"
                : "border-white/[0.08] bg-white/[0.035] text-zinc-300"
            }
          `}
        >
          <Clock3
            size={14}
            className={
              isLowTime
                ? "text-rose-400"
                : "text-violet-400"
            }
          />

          {formatTime(time)}
        </motion.div>
      </div>

      {/* =====================================================
          CHAT
      ===================================================== */}

      <div
        className="
          interview-chat-scroll
          relative
          z-10
          min-h-0
          flex-1
          overflow-y-auto
          px-4
          py-5
        "
      >
        <div className="mx-auto max-w-3xl space-y-5">

          {messages.map(
            (msg, index) => {
              const isAI =
                msg.role ===
                "INTERVIEWER";

              return (
                <motion.div
                  key={`${index}-${msg.role}`}
                  initial={{
                    opacity: 0,
                    y: 10,
                    scale: 0.99,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [
                      0.22,
                      1,
                      0.36,
                      1,
                    ],
                  }}
                  className={`flex items-end gap-2.5 ${
                    isAI
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >

                  {/* AI avatar */}

                  {isAI && (
                    <motion.div
                      whileHover={{
                        scale: 1.06,
                      }}
                      className="
                        mb-1
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-violet-500/20
                        bg-violet-500/10
                      "
                    >
                      <Bot
                        size={15}
                        className="text-violet-400"
                      />
                    </motion.div>
                  )}

                  {/* Message */}

                  <motion.div
                    whileHover={{
                      y: -1,
                    }}
                    className={`
                      relative
                      max-w-[84%]
                      px-4
                      py-3
                      text-[14px]
                      leading-6
                      shadow-lg
                      sm:text-[15px]
                      ${
                        isAI
                          ? "rounded-2xl rounded-bl-md border border-white/[0.07] bg-[#101016] text-zinc-200 shadow-black/10"
                          : "rounded-2xl rounded-br-md bg-gradient-to-br from-violet-600 to-violet-500 text-white shadow-violet-950/20"
                      }
                    `}
                  >
                    {isAI && (
                      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-400/80">
                        <Sparkles size={10} />
                        Interviewer
                      </div>
                    )}

                    <span className="whitespace-pre-wrap">
                      {msg.content}
                    </span>
                  </motion.div>

                  {/* Candidate avatar */}

                  {!isAI && (
                    <motion.div
                      whileHover={{
                        scale: 1.06,
                      }}
                      className="
                        mb-1
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-violet-400/20
                        bg-violet-600/15
                      "
                    >
                      <UserRound
                        size={15}
                        className="text-violet-300"
                      />
                    </motion.div>
                  )}
                </motion.div>
              );
            }
          )}

          {/* AI typing */}

          <AnimatePresence>
            {typingMessage && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                }}
                className="flex items-end gap-2.5"
              >
                <div
                  className="
                    mb-1
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-violet-500/20
                    bg-violet-500/10
                  "
                >
                  <Bot
                    size={15}
                    className="text-violet-400"
                  />
                </div>

                <div
                  className="
                    max-w-[84%]
                    rounded-2xl
                    rounded-bl-md
                    border
                    border-white/[0.07]
                    bg-[#101016]
                    px-4
                    py-3
                    text-[14px]
                    leading-6
                    text-zinc-200
                    sm:text-[15px]
                  "
                >
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-400/80">
                    <Sparkles size={10} />
                    Interviewer
                  </div>

                  {typingMessage}

                  <motion.span
                    animate={{
                      opacity: [1, 0, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                    }}
                    className="ml-1 text-violet-400"
                  >
                    ▋
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading */}

          <AnimatePresence>
            {loading &&
              !typingMessage && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="flex items-end gap-2.5"
                >
                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-violet-500/20
                      bg-violet-500/10
                    "
                  >
                    <Bot
                      size={15}
                      className="text-violet-400"
                    />
                  </div>

                  <div
                    className="
                      rounded-2xl
                      rounded-bl-md
                      border
                      border-white/[0.07]
                      bg-[#101016]
                      px-4
                      py-3.5
                    "
                  >
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map(
                        (item) => (
                          <motion.span
                            key={item}
                            animate={{
                              y: [
                                0,
                                -4,
                                0,
                              ],
                              opacity: [
                                0.35,
                                1,
                                0.35,
                              ],
                            }}
                            transition={{
                              duration: 0.9,
                              repeat: Infinity,
                              delay:
                                item *
                                0.14,
                            }}
                            className="
                              h-1.5
                              w-1.5
                              rounded-full
                              bg-violet-400
                            "
                          />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* =====================================================
          INPUT
      ===================================================== */}

      <div className="relative z-10 shrink-0 border-t border-white/[0.07] bg-[#09090d]/90 px-3 pb-3 pt-3 backdrop-blur-xl sm:px-4">

        <div className="mx-auto max-w-3xl">

          <motion.div
            whileFocus={{
              scale: 1.002,
            }}
            className="
              group
              relative
              flex
              items-end
              gap-2
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.09]
              bg-[#111116]
              p-2
              shadow-xl
              shadow-black/20
              transition-all
              duration-300
              focus-within:border-violet-500/40
              focus-within:shadow-violet-950/10
            "
          >

            {/* Input glow */}

            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100">
              <div className="absolute -inset-10 bg-violet-500/[0.035] blur-3xl" />
            </div>

            <textarea
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }
              onKeyDown={
                handleInputKeyDown
              }
              placeholder="Type your response..."
              rows={1}
              disabled={loading}
              className="
                relative
                max-h-32
                min-h-[42px]
                flex-1
                resize-none
                overflow-y-auto
                bg-transparent
                px-3
                py-2.5
                text-[14px]
                leading-6
                text-white
                outline-none
                placeholder:text-zinc-600
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:text-[15px]
              "
            />

            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={sendMessage}
              disabled={
                loading ||
                !input.trim()
              }
              className="
                relative
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-violet-600
                text-white
                shadow-lg
                shadow-violet-600/20
                transition-all
                duration-300
                hover:bg-violet-500
                disabled:cursor-not-allowed
                disabled:bg-zinc-800
                disabled:text-zinc-600
                disabled:shadow-none
              "
            >
              {loading ? (
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                />
              ) : (
                <Send
                  size={16}
                />
              )}
            </motion.button>
          </motion.div>

          {/* Input footer */}

          <div className="mt-2 flex items-center justify-between px-1">

            <div className="flex items-center gap-2 text-[10px] text-zinc-600">
              <Wifi
                size={11}
                className="text-emerald-400"
              />

              <span className="font-medium text-emerald-400">
                Connected
              </span>

              <span className="text-zinc-800">
                •
              </span>

             
            </div>

            <p className="text-[10px] text-zinc-100">
              Enter to send · Shift + Enter
              for new line
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          SCROLLBAR
      ===================================================== */}

      <style>
        {`
          .interview-chat-scroll::-webkit-scrollbar {
            width: 6px;
          }

          .interview-chat-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .interview-chat-scroll::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.28);
            border-radius: 999px;
          }

          .interview-chat-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.55);
          }

          .interview-chat-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(139, 92, 246, 0.35) transparent;
          }

          textarea::-webkit-scrollbar {
            width: 4px;
          }

          textarea::-webkit-scrollbar-track {
            background: transparent;
          }

          textarea::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.3);
            border-radius: 999px;
          }
        `}
      </style>
    </aside>
  );
}