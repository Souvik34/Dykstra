/* eslint-disable prettier/prettier */

import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guard";


import { DashboardShell } from "@/components/layout/dashboard-shell";
import Reminder from  "@/components/ui/reminder";
import notificationService from "@/services/notificationService";
import { WelcomeCard } from "@/features/dashboard/welcome-card";
import { ProgressCards } from "@/features/dashboard/progress-cards";
import { RecentActivity } from "@/features/dashboard/recent-activity";
import InterviewReadinessCard from "@/features/dashboard/InterviewReadinessCard";
// import AIMentorCard from "../features/dashboard/AIMentorCard";
import AIMentorCard from "@/features/dashboard/AIMentorCard";
import DykstraTour from "@/components/tour/DykstraTour";
import { useDykstraTour } from "../hooks/useDysktraTour";

import { useDashboard } from "@/hooks/useDashboard";

import { dashboardService } from "@/services/dashboardService";

import type { DashboardData } from "@/types/dashboard";

import { useAuthStore } from "@/store/auth-store";

import { useEffect, useState } from "react";

import {
    Brain,
    Sparkles,
    Target,
    Zap,
    Activity,
} from "lucide-react";

import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard")({
    beforeLoad: async ({ location }) => {
        await requireAuth(location);
    },

    head: () => ({
        meta: [
            {
                title: "Dashboard · Dykstra",
            },
            {
                name: "description",
                content:
                    "Your DSA progress, streaks, and upcoming interviews.",
            },
        ],
    }),

    component: DashboardPage,
});

function DashboardPage() {
    const {
        data,
        isLoading,
        error,
    } = useDashboard();

    const user = useAuthStore(
        (s) => s.user
    );
        const {
        isTourOpen,
        initializeTour,
        closeTour,
        replayTour,
    } = useDykstraTour();

    const [dashboard, setDashboard] =
        useState<DashboardData | null>(null);

    const [loading, setLoading] =
        useState(true);
const [showReminder, setShowReminder] = useState(false);
useEffect(() => {
    if (!user?.id) return;

    const checkReminderPreference = async () => {
        try {
            const preference =
                await notificationService.getRevisionReminderPreference();

            if (!preference.revision_reminder_preference_set) {
                setShowReminder(true);
            }
        } catch (error) {
            console.error(
                "Failed to check revision reminder preference:",
                error
            );
        }
    };

    checkReminderPreference();
}, [user?.id]);

    useEffect(() => {
        if (!user?.id) return;

        loadDashboard();
    }, [user]);
    useEffect(() => {
    if (
        !isLoading &&
        !loading &&
        dashboard
    ) {
        initializeTour();
    }
}, [
    isLoading,
    loading,
    dashboard,
    initializeTour,
]);

    const loadDashboard = async () => {
        try {
            const response =
                await dashboardService.getDashboard(
                    user!.id
                );

            setDashboard(response);
        } catch (err) {
            console.error(
                "Dashboard loading error:",
                err
            );
        } finally {
            setLoading(false);
        }
    };
   const handleReminderContinue = async (enabled: boolean) => {
    try {
        await notificationService.setRevisionReminderPreference(enabled);

        setShowReminder(false);
    } catch (error) {
        console.error(
            "Failed to save revision reminder preference:",
            error
        );
    }
};

    /* =========================================================
       LOADING
    ========================================================= */

    if (isLoading || loading) {
        return (
            <DashboardShell>

                <div
                    className="
                        relative
                        flex
                        min-h-[75vh]
                        items-center
                        justify-center
                        overflow-hidden
                    "
                >

                    {/* Background */}

                    <div
                        className="
                            absolute
                            h-72
                            w-72
                            rounded-full
                            bg-violet-600/10
                            blur-[120px]
                        "
                    />

                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.7, 0.3],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                        }}
                        className="
                            absolute
                            h-20
                            w-20
                            rounded-full
                            border
                            border-violet-400/20
                        "
                    />

                    <div className="relative z-10 text-center">

                        <motion.div
                            animate={{
                                rotate: 360,
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="
                                mx-auto
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/[0.04]
                            "
                        >
                            <Brain
                                size={24}
                                className="text-violet-300"
                            />
                        </motion.div>

                        <motion.p
                            animate={{
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                            }}
                            className="
                                mt-5
                                text-lg
                                font-semibold
                                text-white
                            "
                        >
                            Building your dashboard...
                        </motion.p>

                        <p
                            className="
                                mt-1
                                text-sm
                                font-medium
                                text-zinc-400
                            "
                        >
                            Analysing your coding journey
                        </p>

                    </div>

                </div>

            </DashboardShell>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (error) {
        return (
            <DashboardShell>

                <div className="flex min-h-[70vh] items-center justify-center">

                    <div
                        className="
                            rounded-3xl
                            border
                            border-red-400/20
                            bg-red-400/[0.04]
                            px-10
                            py-8
                            text-center
                        "
                    >

                        <Zap
                            size={28}
                            className="
                                mx-auto
                                text-red-300
                            "
                        />

                        <p
                            className="
                                mt-4
                                text-lg
                                font-bold
                                text-white
                            "
                        >
                            Dashboard unavailable
                        </p>

                        <p
                            className="
                                mt-1
                                text-sm
                                font-medium
                                text-zinc-400
                            "
                        >
                            Something went wrong while
                            loading your data.
                        </p>

                    </div>

                </div>

            </DashboardShell>
        );
    }

    /* =========================================================
       DASHBOARD
    ========================================================= */

    return (
    <DashboardShell>
        <div className="relative overflow-hidden">

            {/* =====================================================
                GLOBAL BACKGROUND ATMOSPHERE
            ===================================================== */}

            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

                <div
                    className="
                        absolute
                        left-[8%]
                        top-[8%]
                        h-[420px]
                        w-[420px]
                        rounded-full
                        bg-violet-600/[0.035]
                        blur-[140px]
                    "
                />

                <div
                    className="
                        absolute
                        right-[5%]
                        top-[35%]
                        h-[360px]
                        w-[360px]
                        rounded-full
                        bg-blue-500/[0.025]
                        blur-[130px]
                    "
                />

                <div
                    className="
                        absolute
                        bottom-[5%]
                        left-[40%]
                        h-[300px]
                        w-[300px]
                        rounded-full
                        bg-cyan-500/[0.018]
                        blur-[120px]
                    "
                />

            </div>

            <div className="space-y-8">

                {/* =================================================
                    01 — WELCOME
                ================================================= */}

                {dashboard && (
                    <WelcomeCard dashboard={dashboard} />
                )}


                {/* =================================================
                    02 — AI MENTOR
                ================================================= */}

                <motion.section
                data-tour="tour-ai-mentor"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.55,
                        delay: 0.08,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    <AIMentorCard dashboard={dashboard} />
                </motion.section>


                {/* =================================================
                    03 — INTERVIEW READINESS
                ================================================= */}

                <motion.section
                data-tour="tour-interview-readiness"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.55,
                        delay: 0.16,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    <InterviewReadinessCard
                        dashboard={dashboard}
                    />
                </motion.section>


                {/* =================================================
                    04 — ACTIVITY + DSA INTELLIGENCE
                ================================================= */}

                <motion.section

    data-tour="tour-activity"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.55,
                        delay: 0.24,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="
                        grid
                        grid-cols-1
                        gap-6
                        xl:grid-cols-[1.65fr_1fr]
                    "
                >

                    {/* RECENT ACTIVITY */}

                    <RecentActivity
                        dashboard={dashboard}
                    />


                    {/* DSA INTELLIGENCE */}

                    <ProgressCards
                        dashboard={data}
                    />

                </motion.section>

            </div>
        </div>
        <DykstraTour
    open={isTourOpen}
    onClose={closeTour}
/>
{showReminder && (
    <Reminder onContinue={handleReminderContinue} />
)}
    </DashboardShell>
);
}