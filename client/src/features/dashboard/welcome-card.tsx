/* eslint-disable prettier/prettier */

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import {
    Sparkles,
    ArrowRight,
    Flame,
    Target,
    Sun,
    Sunset,
    Sunrise,
    CheckCircle2,
    Brain,
    ChevronRight,
    Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";

interface DashboardData {
    stats: {
        solved: number;
        easy: number;
        medium: number;
        hard: number;
        revisionPending: number;
        streak: number;
        longestStreak: number;
    };

    readiness: {
        score: number;
        level: string;
    };

    revision: {
        dueCount: number;
    };

    focusTopic?: {
        topic?: string;
    } | null;
}

interface Props {
    dashboard: DashboardData;
}

export function WelcomeCard({ dashboard }: Props) {
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();

    const name = user?.name?.split(" ")[0] ?? "there";

    const hour = new Date().getHours();

    let greeting = "Good Evening";
    let GreetingIcon = Sunset;

    if (hour >= 5 && hour < 12) {
        greeting = "Good Morning";
        GreetingIcon = Sunrise;
    } else if (hour >= 12 && hour < 17) {
        greeting = "Good Afternoon";
        GreetingIcon = Sun;
    }

    const revisionDue = dashboard.revision?.dueCount ?? 0;
    const solved = dashboard.stats?.solved ?? 0;
    const streak = dashboard.stats?.streak ?? 0;
    const readiness = dashboard.readiness?.score ?? 0;
    const readinessLevel =
        dashboard.readiness?.level ?? "Beginner";

    const focusTopic =
        dashboard.focusTopic?.topic ?? null;

    return (
        <motion.section
            initial={{
                opacity: 0,
                y: 18,
                scale: 0.985,
            }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
            }}
            transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
            }}
            className="
                group
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-white/[0.08]
                bg-[#09090b]
                shadow-2xl
                shadow-black/30
            "
        >
            {/* =====================================================
                AMBIENT BACKGROUND
            ===================================================== */}

            <motion.div
                className="
                    pointer-events-none
                    absolute
                    -right-32
                    -top-40
                    h-[420px]
                    w-[420px]
                    rounded-full
                    bg-violet-600/[0.14]
                    blur-[120px]
                "
                animate={{
                    scale: [1, 1.12, 1],
                    opacity: [0.45, 0.7, 0.45],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="
                    pointer-events-none
                    absolute
                    -bottom-44
                    -left-40
                    h-[360px]
                    w-[360px]
                    rounded-full
                    bg-cyan-500/[0.08]
                    blur-[120px]
                "
                animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.25, 0.45, 0.25],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* =====================================================
                MOVING GRID
            ===================================================== */}

            <motion.div
                className="
                    pointer-events-none
                    absolute
                    -inset-20
                    opacity-[0.025]
                    [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
                    [background-size:36px_36px]
                "
                animate={{
                    x: [0, 36],
                    y: [0, 36],
                }}
                transition={{
                    duration: 16,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {/* =====================================================
                LIGHT SWEEP
            ===================================================== */}

            <motion.div
                className="
                    pointer-events-none
                    absolute
                    -left-1/3
                    top-0
                    h-full
                    w-1/4
                    rotate-[18deg]
                    bg-white/[0.025]
                    blur-2xl
                "
                animate={{
                    x: ["0%", "520%"],
                }}
                transition={{
                    duration: 9,
                    repeat: Infinity,
                    repeatDelay: 6,
                    ease: "easeInOut",
                }}
            />

            {/* =====================================================
                CONTENT
            ===================================================== */}

            <div className="relative p-6 md:p-8 lg:p-9">

                <div className="grid gap-8 lg:grid-cols-[1fr_330px] lg:items-center">

                    {/* =================================================
                        LEFT CONTENT
                    ================================================= */}

                    <div>

                        {/* Greeting */}

                        <motion.div
                            initial={{
                                opacity: 0,
                                x: -12,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            transition={{
                                delay: 0.1,
                                duration: 0.5,
                            }}
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-violet-400/15
                                bg-violet-400/[0.07]
                                px-3.5
                                py-1.5
                                text-sm
                                font-medium
                                text-violet-200
                            "
                        >
                            <motion.span
                                animate={{
                                    rotate: [0, -7, 7, 0],
                                }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    repeatDelay: 4,
                                }}
                            >
                                <GreetingIcon size={15} />
                            </motion.span>

                            {greeting}
                        </motion.div>

                        {/* Heading */}

                        <motion.h1
                            initial={{
                                opacity: 0,
                                y: 12,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.18,
                                duration: 0.6,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="
                                mt-5
                                text-4xl
                                font-bold
                                tracking-tight
                                text-white
                                sm:text-5xl
                                md:text-[46px]
                            "
                        >
                            Ready to sharpen
                            <br />

                            <span className="relative inline-block">
                                your edge,{" "}

                                <motion.span
                                    className="
                                        inline-block
                                        bg-gradient-to-r
                                        from-violet-400
                                        via-fuchsia-300
                                        to-cyan-300
                                        bg-clip-text
                                        text-transparent
                                    "
                                    animate={{
                                        backgroundPosition: [
                                            "0% 50%",
                                            "100% 50%",
                                            "0% 50%",
                                        ],
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    style={{
                                        backgroundSize: "200% 200%",
                                    }}
                                >
                                    {name}?
                                </motion.span>
                            </span>
                        </motion.h1>

                        {/* Description */}

                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 10,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.3,
                                duration: 0.55,
                            }}
                            className="
                                mt-4
                                max-w-xl
                                text-base
                                font-medium
                                leading-7
                                text-zinc-200
                                md:text-lg
                            "
                        >
                            You've solved{" "}
                            <span className="font-bold text-white">
                                {solved}
                            </span>{" "}
                            problems so far. Your interview readiness is{" "}
                            <span className="font-bold text-violet-300">
                                {readinessLevel}
                            </span>
                            .
                        </motion.p>

                        {/* =================================================
                            QUICK METRICS
                        ================================================= */}

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 12,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.4,
                                duration: 0.55,
                            }}
                            className="
                                mt-6
                                flex
                                flex-wrap
                                items-center
                                gap-3
                            "
                        >

                            <QuickMetric
                                icon={CheckCircle2}
                                label="Problems solved"
                                value={solved}
                                iconClass="text-emerald-400"
                            />

                            {streak > 0 && (
                                <QuickMetric
                                    icon={Flame}
                                    label="Day streak"
                                    value={streak}
                                    iconClass="text-orange-400"
                                />
                            )}

                            {focusTopic && (
                                <QuickMetric
                                    icon={Brain}
                                    label="Current focus"
                                    value={focusTopic}
                                    iconClass="text-cyan-400"
                                    textValue
                                />
                            )}

                        </motion.div>

                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 12,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.5,
                                duration: 0.55,
                            }}
                            className="
                                mt-7
                                flex
                                flex-wrap
                                gap-3
                            "
                        >

                            <motion.div
                                whileHover={{
                                    y: -2,
                                }}
                                whileTap={{
                                    scale: 0.97,
                                }}
                            >
                                <Button
                                    onClick={() =>
                                        navigate({
                                            to: "/problems",
                                        })
                                    }
                                    className="
                                        relative
                                        h-11
                                        overflow-hidden
                                        border-0
                                        bg-gradient-to-r
                                        from-violet-600
                                        via-violet-500
                                        to-blue-500
                                        px-5
                                        text-base
                                        font-semibold
                                        text-white
                                        shadow-lg
                                        shadow-violet-500/20
                                    "
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Continue Practice

                                        <motion.span
                                            animate={{
                                                x: [0, 3, 0],
                                            }}
                                            transition={{
                                                duration: 1.8,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                            }}
                                        >
                                            <ArrowRight size={18} />
                                        </motion.span>
                                    </span>

                                    <motion.span
                                        className="
                                            pointer-events-none
                                            absolute
                                            -left-10
                                            top-0
                                            h-full
                                            w-8
                                            rotate-12
                                            bg-white/20
                                            blur-md
                                        "
                                        animate={{
                                            x: ["0%", "550%"],
                                        }}
                                        transition={{
                                            duration: 2.8,
                                            repeat: Infinity,
                                            repeatDelay: 4,
                                            ease: "easeInOut",
                                        }}
                                    />
                                </Button>
                            </motion.div>

                            <motion.div
                                whileHover={{
                                    y: -2,
                                }}
                                whileTap={{
                                    scale: 0.97,
                                }}
                            >
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        navigate({
                                            to: "/revisions",
                                        })
                                    }
                                    className={`
                                        h-11
                                        gap-2
                                        border-white/[0.12]
                                        bg-white/[0.025]
                                        px-4
                                        text-sm
                                        font-semibold
                                        text-zinc-100
                                        transition-all
                                        duration-300
                                        hover:border-violet-400/30
                                        hover:bg-violet-400/[0.07]
                                        ${
                                            revisionDue > 0
                                                ? "border-violet-400/20"
                                                : ""
                                        }
                                    `}
                                >
                                    {revisionDue > 0 ? (
                                        <>
                                            <Target
                                                size={17}
                                                className="text-violet-300"
                                            />

                                            <span>
                                                {revisionDue} revision
                                                {revisionDue !== 1
                                                    ? "s"
                                                    : ""}{" "}
                                                due
                                            </span>

                                            <ChevronRight
                                                size={16}
                                                className="text-zinc-300"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2
                                                size={17}
                                                className="text-emerald-400"
                                            />

                                            <span>
                                                Revisions complete
                                            </span>
                                        </>
                                    )}
                                </Button>
                            </motion.div>

                        </motion.div>
                    </div>

                    {/* =================================================
                        RIGHT READINESS PANEL
                    ================================================= */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            x: 20,
                            scale: 0.97,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            scale: 1,
                        }}
                        transition={{
                            delay: 0.3,
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="
                            relative
                            overflow-hidden
                            rounded-3xl
                            border
                            border-white/[0.08]
                            bg-white/[0.025]
                            p-5
                            backdrop-blur-xl
                        "
                    >

                        <motion.div
                            className="
                                pointer-events-none
                                absolute
                                -right-12
                                -top-12
                                h-32
                                w-32
                                rounded-full
                                bg-violet-500/15
                                blur-3xl
                            "
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.4, 0.7, 0.4],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />

                        <div className="relative">

                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-2">

                                    <div
                                        className="
                                            flex
                                            h-8
                                            w-8
                                            items-center
                                            justify-center
                                            rounded-lg
                                            border
                                            border-violet-400/15
                                            bg-violet-400/[0.08]
                                        "
                                    >
                                        <Target
                                            size={15}
                                            className="text-violet-300"
                                        />
                                    </div>

                                    <span className="text-sm font-semibold text-zinc-100">
                                        Interview readiness
                                    </span>

                                </div>

                                <Zap
                                    size={16}
                                    className="text-violet-400"
                                />

                            </div>

                            <div className="mt-7 flex items-end justify-between">

                                <div>

                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: 8,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        transition={{
                                            delay: 0.65,
                                            duration: 0.5,
                                        }}
                                        className="
                                            text-5xl
                                            font-bold
                                            tracking-tight
                                            text-white
                                        "
                                    >
                                        {readiness}

                                        <span className="text-2xl text-violet-400">
                                            %
                                        </span>
                                    </motion.div>

                                    <p className="mt-1 text-sm font-medium text-zinc-200">
                                        {readinessLevel}
                                    </p>

                                </div>

                                <div className="text-right">

                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                                        Progress
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-zinc-200">
                                        {solved} solved
                                    </p>

                                </div>

                            </div>

                            <div className="mt-5">

                                <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">

                                    <motion.div
                                        initial={{
                                            width: 0,
                                        }}
                                        animate={{
                                            width: `${readiness}%`,
                                        }}
                                        transition={{
                                            delay: 0.55,
                                            duration: 1.1,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                        className="
                                            relative
                                            h-full
                                            rounded-full
                                            bg-gradient-to-r
                                            from-violet-600
                                            via-fuchsia-400
                                            to-cyan-400
                                        "
                                    >

                                        <motion.div
                                            className="
                                                absolute
                                                right-0
                                                top-0
                                                h-full
                                                w-10
                                                bg-white/30
                                                blur-sm
                                            "
                                            animate={{
                                                opacity: [0, 1, 0],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatDelay: 2,
                                            }}
                                        />

                                    </motion.div>

                                </div>

                            </div>

                            <div className="my-5 h-px bg-white/[0.08]" />

                            <div className="flex items-start gap-3">

                                <motion.div
                                    animate={{
                                        rotate: [0, 4, -4, 0],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        repeatDelay: 3,
                                    }}
                                    className="
                                        mt-0.5
                                        flex
                                        h-8
                                        w-8
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-cyan-400/[0.07]
                                    "
                                >
                                    <Sparkles
                                        size={15}
                                        className="text-cyan-300"
                                    />
                                </motion.div>

                                <div>

                                    <p className="text-sm font-semibold text-zinc-100">
                                        Keep the momentum going
                                    </p>

                                    <p className="mt-1 text-xs font-medium leading-5 text-zinc-200">
                                        {revisionDue > 0
                                            ? `You have ${revisionDue} revision${
                                                  revisionDue !== 1
                                                      ? "s"
                                                      : ""
                                              } waiting.`
                                            : "Your revision queue is clear."}
                                    </p>

                                </div>

                            </div>

                        </div>
                    </motion.div>
                </div>

                {/* =====================================================
                    BOTTOM STATUS
                ===================================================== */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 8,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.65,
                        duration: 0.5,
                    }}
                    className="
                        mt-7
                        flex
                        items-center
                        justify-between
                        border-t
                        border-white/[0.08]
                        pt-5
                    "
                >

                    <div className="flex items-center gap-2">

                        <span className="relative flex h-2 w-2">

                            <motion.span
                                className="
                                    absolute
                                    inline-flex
                                    h-full
                                    w-full
                                    rounded-full
                                    bg-emerald-400
                                "
                                animate={{
                                    scale: [1, 1.8, 1],
                                    opacity: [0.8, 0, 0.8],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                }}
                            />

                            <span className="relative h-2 w-2 rounded-full bg-emerald-400" />

                        </span>

                        <span className="text-sm font-medium text-zinc-200">
                            Dykstra is tracking your progress
                        </span>

                    </div>

                    <span className="hidden text-sm font-medium text-zinc-300 sm:block">
                        Keep solving. Keep improving.
                    </span>

                </motion.div>

            </div>
        </motion.section>
    );
}

/* =========================================================
   QUICK METRIC
========================================================= */

function QuickMetric({
    icon: Icon,
    label,
    value,
    iconClass,
    textValue = false,
}: {
    icon: any;
    label: string;
    value: string | number;
    iconClass: string;
    textValue?: boolean;
}) {
    return (
        <motion.div
            whileHover={{
                y: -2,
            }}
            className="
                flex
                items-center
                gap-2.5
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.025]
                px-3
                py-2
                transition-colors
                duration-300
                hover:border-white/[0.14]
                hover:bg-white/[0.04]
            "
        >

            <Icon
                size={15}
                className={iconClass}
            />

            <div>

                <p className="text-[11px] font-medium text-zinc-300">
                    {label}
                </p>

                <p
                    className={`
                        text-sm
                        font-bold
                        ${
                            textValue
                                ? "max-w-[120px] truncate text-zinc-100"
                                : "text-white"
                        }
                    `}
                >
                    {value}
                </p>

            </div>

        </motion.div>
    );
}