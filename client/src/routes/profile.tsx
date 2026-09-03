/* eslint-disable prettier/prettier */

import { useEffect, useMemo, useState } from "react";

import {
    Activity,
    ArrowLeft,
    Award,
    BarChart3,
    Check,
    ChevronRight,
    Code2,
    ExternalLink,
    Flame,
    Link2,
    Loader2,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingDown,
    TrendingUp,
    Unlink,
    User,
    Zap,
} from "lucide-react";

import {
    createFileRoute,
    useNavigate,
} from "@tanstack/react-router";

import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { toast } from "sonner";

import leetcodeService from "@/services/leetcodeService";
import { dashboardService } from "@/services/dashboardService";
import { useAuthStore } from "@/store/auth-store";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { DashboardData } from "@/types/dashboard";

export const Route = createFileRoute("/profile")({
    component: ProfilePage,
});

/* ============================================================
   TYPES
============================================================ */

interface LeetCodeProfile {
    valid: boolean;
    username: string;
    profileUrl: string;
    avatar?: string;
    realName?: string;
    ranking?: number;
    reputation?: number;
    starRating?: number | string;
}

interface LeetCodeStats {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    totalSubmissions?: number;
    acceptanceRate?: number | string;
    contestRating?: number | string | null;
}

interface LeetCodeBadge {
    name: string;
    icon?: string;
    earned_at?: string;
}

interface LeetCodeData {
    connection?: {
        username: string;
        connected_at?: string;
        last_synced_at?: string;
    };

    profile?: {
        username?: string;
        avatar?: string;
        real_name?: string;
        ranking?: number;
        reputation?: number;
        star_rating?: number | string;
        profile_url?: string;
    };

    stats?: {
        total_solved?: number;
        easy_solved?: number;
        medium_solved?: number;
        hard_solved?: number;
        total_submissions?: number;
        acceptance_rate?: number | string;
        contest_rating?: number | string | null;
    };

    badges?: LeetCodeBadge[];

    calendar?: {
        activity_date: string;
        submission_count: number;
    }[];
}

interface DailySolve {
    date: string;
    count: number | string;
}

interface TopicDistribution {
    topic: string;
    count: number | string;
}

interface DifficultyDistribution {
    difficulty: string;
    count: number | string;
}

interface RecentActivityItem {
    solved_at: string;
    title: string;
    difficulty: string;
    topic: string;
}

interface DashboardProfileData {
    stats?: {
        solved?: number;
        easy?: number;
        medium?: number;
        hard?: number;
        revisionPending?: number;
        streak?: number;
        longestStreak?: number;
    };

    readiness?: {
        score?: number;
        level?: string;
    };

    revision?: {
        dueCount?: number;
        items?: unknown[];
    };

    focusTopic?: {
        topic?: string;
        solved?: number;
        last_solved?: string;
        hard?: number;
        medium?: number;
        score?: number;
        confidence?: number;
        type?: string;
    } | null;

    strongTopics?: {
        topic: string;
        solved: number;
    }[];

    analytics?: {
        dailySolve?: DailySolve[];
        topicDistribution?: TopicDistribution[];
        difficultyDistribution?: DifficultyDistribution[];
    };

    recentActivity?: RecentActivityItem[];
}

interface DashboardResponse {
    stats?: DashboardProfileData["stats"];
    readiness?: DashboardProfileData["readiness"];
    revision?: DashboardProfileData["revision"];
    focusTopic?: DashboardProfileData["focusTopic"];
    strongTopics?: DashboardProfileData["strongTopics"];
    analytics?: DashboardProfileData["analytics"];
    recentActivity?: RecentActivityItem[];
}

/* ============================================================
   HELPERS
============================================================ */

function extractLeetCodeData(response: any): LeetCodeData {
    return response?.data?.data || response?.data || {};
}

function extractDashboardData(response: any): DashboardResponse {
    return (
        response?.data?.data ||
        response?.data ||
        response ||
        {}
    );
}

function normalizeTopic(topic: string) {
    return topic
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function formatTopic(topic: string) {
    return topic
        .split(" ")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1),
        )
        .join(" ");
}

function formatDifficulty(difficulty: string) {
    return (
        difficulty.charAt(0).toUpperCase() +
        difficulty.slice(1).toLowerCase()
    );
}

function formatDate(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Unknown date";
    }

    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
    });
}

function formatRelativeDate(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const diff =
        Date.now() - date.getTime();

    const minutes = Math.floor(
        diff / (1000 * 60),
    );

    if (minutes < 1) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
        return `${days}d ago`;
    }

    return formatDate(dateString);
}

/* ============================================================
   LEETCODE DATA
============================================================ */

function applyLeetCodeData(
    data: LeetCodeData,
    setters: {
        setLeetcode: React.Dispatch<
            React.SetStateAction<LeetCodeProfile | null>
        >;

        setStats: React.Dispatch<
            React.SetStateAction<LeetCodeStats | null>
        >;

        setBadges: React.Dispatch<
            React.SetStateAction<LeetCodeBadge[]>
        >;

        setConnection: React.Dispatch<
            React.SetStateAction<
                LeetCodeData["connection"] | null
            >
        >;
    },
) {
    const {
        setLeetcode,
        setStats,
        setBadges,
        setConnection,
    } = setters;

    if (data.connection) {
        setConnection(data.connection);
    }

    const username =
        data.connection?.username ||
        data.profile?.username;

    if (username) {
        setLeetcode({
            valid: true,
            username,
            profileUrl:
                data.profile?.profile_url ||
                `https://leetcode.com/u/${username}`,
            avatar: data.profile?.avatar,
            realName: data.profile?.real_name,
            ranking: data.profile?.ranking,
            reputation: data.profile?.reputation,
            starRating: data.profile?.star_rating,
        });
    }

    if (data.stats) {
        setStats({
            totalSolved: Number(
                data.stats.total_solved ?? 0,
            ),
            easySolved: Number(
                data.stats.easy_solved ?? 0,
            ),
            mediumSolved: Number(
                data.stats.medium_solved ?? 0,
            ),
            hardSolved: Number(
                data.stats.hard_solved ?? 0,
            ),
            totalSubmissions: Number(
                data.stats.total_submissions ?? 0,
            ),
            acceptanceRate:
                data.stats.acceptance_rate ?? 0,
            contestRating:
                data.stats.contest_rating ?? null,
        });
    }

    if (Array.isArray(data.badges)) {
        setBadges(data.badges);
    }
}

/* ============================================================
   PAGE
============================================================ */

function ProfilePage() {
    const navigate = useNavigate();

    const user = useAuthStore(
        (state) => state.user,
    );

    const [dashboard, setDashboard] =
        useState<DashboardResponse | null>(null);

    const [dashboardLoading, setDashboardLoading] =
        useState(true);

    const [dashboardError, setDashboardError] =
        useState(false);

    const [leetcode, setLeetcode] =
        useState<LeetCodeProfile | null>(null);

    const [leetcodeStats, setLeetcodeStats] =
        useState<LeetCodeStats | null>(null);

    const [badges, setBadges] =
        useState<LeetCodeBadge[]>([]);

    const [connection, setConnection] =
        useState<LeetCodeData["connection"] | null>(
            null,
        );

    const [username, setUsername] =
        useState("");

    const [checkingUsername, setCheckingUsername] =
        useState(false);

    const [connecting, setConnecting] =
        useState(false);

    const [disconnecting, setDisconnecting] =
        useState(false);

    const [showLeetCodeDetails, setShowLeetCodeDetails] =
        useState(false);

    /* ============================================================
       LOAD DYKSTRA PROFILE
    ============================================================ */

    const loadDashboard = async () => {
        if (!user?.id) return;

        setDashboardLoading(true);
        setDashboardError(false);

        try {
            const response =
                await dashboardService.getDashboard(
                    user.id,
                );

            setDashboard(
                extractDashboardData(response),
            );
        } catch (error) {
            console.error(
                "Profile analytics loading error:",
                error,
            );

            setDashboardError(true);
        } finally {
            setDashboardLoading(false);
        }
    };

    /* ============================================================
       LOAD LEETCODE
    ============================================================ */

    const loadLeetCode = async () => {
        try {
            const response =
                await leetcodeService.getProfile();

            const data =
                extractLeetCodeData(response);

            applyLeetCodeData(data, {
                setLeetcode,
                setStats: setLeetcodeStats,
                setBadges,
                setConnection,
            });

            if (data.connection?.username) {
                setUsername(
                    data.connection.username,
                );
            }
        } catch (error) {
            console.error(
                "LeetCode profile loading error:",
                error,
            );

            setLeetcode(null);
            setLeetcodeStats(null);
            setBadges([]);
            setConnection(null);
        }
    };

    useEffect(() => {
        if (!user?.id) return;

        loadDashboard();
        loadLeetCode();
    }, [user?.id]);

    /* ============================================================
       LEETCODE CONNECT
    ============================================================ */

    const validateLeetCodeUsername = async (
        value: string,
    ) => {
        const cleanUsername = value.trim();

        if (!cleanUsername) return;

        setCheckingUsername(true);

        try {
            const response =
                await leetcodeService.validateProfile(
                    cleanUsername,
                );

            if (!response.data?.success) {
                setLeetcode(null);

                toast.error(
                    response.data?.message ||
                        "LeetCode username not found.",
                );

                return;
            }

            const profile =
                response.data.data;

            setLeetcode({
                valid: true,
                username:
                    profile.username ||
                    cleanUsername,
                profileUrl:
                    profile.profileUrl ||
                    `https://leetcode.com/u/${
                        profile.username ||
                        cleanUsername
                    }`,
                avatar: profile.avatar,
                realName: profile.realName,
                ranking: profile.ranking,
                reputation: profile.reputation,
                starRating: profile.starRating,
            });
        } catch (error: any) {
            console.error(
                "LeetCode validation failed:",
                error,
            );

            setLeetcode(null);

            toast.error(
                error?.response?.data?.message ||
                    "Unable to verify LeetCode profile.",
            );
        } finally {
            setCheckingUsername(false);
        }
    };

    const handleConnect = async () => {
        const cleanUsername = username.trim();

        if (!cleanUsername) {
            toast.error(
                "Enter your LeetCode username.",
            );
            return;
        }

        setConnecting(true);

        try {
            const validation =
                await leetcodeService.validateProfile(
                    cleanUsername,
                );

            if (!validation.data?.success) {
                throw new Error(
                    validation.data?.message ||
                        "Invalid LeetCode profile.",
                );
            }

            await leetcodeService.connectProfile(
                cleanUsername,
            );

            const profileResponse =
                await leetcodeService.getProfile();

            const data =
                extractLeetCodeData(
                    profileResponse,
                );

            applyLeetCodeData(data, {
                setLeetcode,
                setStats: setLeetcodeStats,
                setBadges,
                setConnection,
            });

            setUsername(
                data.connection?.username ||
                    data.profile?.username ||
                    cleanUsername,
            );

            toast.success(
                `@${cleanUsername} connected successfully`,
            );
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Unable to connect LeetCode.",
            );
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        setDisconnecting(true);

        try {
            await leetcodeService.disconnectProfile();

            setLeetcode(null);
            setLeetcodeStats(null);
            setBadges([]);
            setConnection(null);
            setUsername("");

            toast.success(
                "LeetCode profile disconnected.",
            );
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                    "Unable to disconnect LeetCode.",
            );
        } finally {
            setDisconnecting(false);
        }
    };

    const handleSync = async () => {
        setCheckingUsername(true);

        try {
            const response =
                await leetcodeService.getProfile();

            const data =
                extractLeetCodeData(response);

            applyLeetCodeData(data, {
                setLeetcode,
                setStats: setLeetcodeStats,
                setBadges,
                setConnection,
            });

            toast.success(
                "LeetCode data refreshed.",
            );
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                    "Unable to refresh LeetCode data.",
            );
        } finally {
            setCheckingUsername(false);
        }
    };

    /* ============================================================
       DYKSTRA DATA
    ============================================================ */

    const stats = dashboard?.stats;

    const solved =
        Number(stats?.solved ?? 0);

    const easy =
        Number(stats?.easy ?? 0);

    const medium =
        Number(stats?.medium ?? 0);

    const hard =
        Number(stats?.hard ?? 0);

    const streak =
        Number(stats?.streak ?? 0);

    const longestStreak =
        Number(stats?.longestStreak ?? 0);

    const revisionPending =
        Number(stats?.revisionPending ?? 0);

    const readinessScore =
        Number(
            dashboard?.readiness?.score ?? 0,
        );

    const readinessLevel =
        dashboard?.readiness?.level ||
        "Getting Started";

    const dailySolve =
        dashboard?.analytics?.dailySolve ?? [];

    const topicDistribution =
        dashboard?.analytics
            ?.topicDistribution ?? [];

    const difficultyDistribution =
        dashboard?.analytics
            ?.difficultyDistribution ?? [];

    const recentActivity =
        dashboard?.recentActivity ?? [];

    /* ============================================================
       TOPIC ANALYSIS
    ============================================================ */

    const topicAnalysis = useMemo(() => {
        if (!topicDistribution.length) {
            return [];
        }

        const topicMap = new Map<
            string,
            number
        >();

        topicDistribution.forEach((item) => {
            const topic =
                normalizeTopic(item.topic);

            const count =
                Number(item.count ?? 0);

            if (!topic) return;

            topicMap.set(
                topic,
                (topicMap.get(topic) || 0) +
                    count,
            );
        });

        const maxCount =
            Math.max(
                ...Array.from(
                    topicMap.values(),
                ),
                1,
            );

        const recentTopicMap =
            new Map<string, number>();

        recentActivity.forEach((item) => {
            const topic =
                normalizeTopic(
                    item.topic || "",
                );

            if (!topic) return;

            recentTopicMap.set(
                topic,
                (recentTopicMap.get(topic) ||
                    0) + 1,
            );
        });

        const difficultyWeight: Record<
            string,
            number
        > = {
            easy: 1,
            medium: 2,
            hard: 3,
        };

        return Array.from(
            topicMap.entries(),
        )
            .map(([topic, count]) => {
                const recent =
                    recentTopicMap.get(topic) ||
                    0;

                const difficultyForTopic =
                    recentActivity
                        .filter(
                            (item) =>
                                normalizeTopic(
                                    item.topic ||
                                        "",
                                ) === topic,
                        )
                        .reduce(
                            (
                                total,
                                item,
                            ) =>
                                total +
                                (difficultyWeight[
                                    item.difficulty?.toLowerCase()
                                ] || 1),
                            0,
                        );

                const recentAverage =
                    recent > 0
                        ? difficultyForTopic /
                          recent
                        : 1;

                /*
                 * This is not fake data.
                 *
                 * The score is derived from:
                 * - actual topic coverage
                 * - actual recent practice
                 * - actual recent difficulty
                 *
                 * It is intentionally called a
                 * "strength signal", not mastery.
                 */

                const coverageScore =
                    (count / maxCount) *
                    60;

                const recentScore =
                    Math.min(
                        recent * 8,
                        20,
                    );

                const difficultyScore =
                    Math.min(
                        recentAverage * 7,
                        20,
                    );

                const signal = Math.round(
                    Math.min(
                        100,
                        coverageScore +
                            recentScore +
                            difficultyScore,
                    ),
                );

                return {
                    topic,
                    count,
                    recent,
                    signal,
                };
            })
            .sort(
                (a, b) =>
                    b.signal - a.signal,
            );
    }, [
        topicDistribution,
        recentActivity,
    ]);

    const strongestTopics =
        topicAnalysis.slice(0, 4);

    const weakestTopics =
        [...topicAnalysis]
            .sort(
                (a, b) =>
                    a.signal - b.signal,
            )
            .slice(0, 4);

    /* ============================================================
       RADAR
    ============================================================ */

    const radarData = useMemo(() => {
        const selected =
            topicAnalysis.slice(0, 7);

        return selected.map((item) => ({
            topic: formatTopic(
                item.topic,
            ),
            score: item.signal,
        }));
    }, [topicAnalysis]);

    /* ============================================================
       DIFFICULTY ANALYSIS
    ============================================================ */

    const difficultyData = useMemo(() => {
        const source =
            difficultyDistribution;

        if (!source.length) {
            return [];
        }

        return source.map((item) => ({
            name: formatDifficulty(
                item.difficulty,
            ),
            value: Number(
                item.count ?? 0,
            ),
        }));
    }, [difficultyDistribution]);

    const hardPercentage =
        solved > 0
            ? Math.round(
                  (hard / solved) * 100,
              )
            : 0;

    const mediumPercentage =
        solved > 0
            ? Math.round(
                  (medium / solved) * 100,
              )
            : 0;

    /* ============================================================
       ACTIVITY
    ============================================================ */

    const activityMap = useMemo(() => {
        const map = new Map<
            string,
            number
        >();

        dailySolve.forEach((item) => {
            const date = new Date(
                item.date,
            );

            if (
                Number.isNaN(
                    date.getTime(),
                )
            ) {
                return;
            }

            const key =
                date
                    .toISOString()
                    .split("T")[0];

            map.set(
                key,
                Number(item.count ?? 0),
            );
        });

        return map;
    }, [dailySolve]);

    const activityDays = useMemo(() => {
        const today = new Date();

        const end = new Date(today);

        end.setHours(
            23,
            59,
            59,
            999,
        );

        const start = new Date(end);

        start.setDate(
            start.getDate() - 364,
        );

        const result: {
            date: string;
            count: number;
        }[] = [];

        const cursor = new Date(
            start,
        );

        while (cursor <= end) {
            const key =
                cursor
                    .toISOString()
                    .split("T")[0];

            result.push({
                date: key,
                count:
                    activityMap.get(key) ||
                    0,
            });

            cursor.setDate(
                cursor.getDate() + 1,
            );
        }

        return result;
    }, [activityMap]);

    const activityTotal =
        dailySolve.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.count ?? 0,
                ),
            0,
        );

    const activityActiveDays =
        dailySolve.filter(
            (item) =>
                Number(item.count ?? 0) >
                0,
        ).length;

    const bestActivityDay =
        dailySolve.length
            ? Math.max(
                  ...dailySolve.map(
                      (item) =>
                          Number(
                              item.count ??
                                  0,
                          ),
                  ),
              )
            : 0;

    const activityWeeks =
        useMemo(() => {
            const weeks: {
                date: string;
                count: number;
            }[][] = [];

            for (
                let index = 0;
                index <
                activityDays.length;
                index += 7
            ) {
                weeks.push(
                    activityDays.slice(
                        index,
                        index + 7,
                    ),
                );
            }

            return weeks;
        }, [activityDays]);

    const getActivityLevel = (
        count: number,
    ) => {
        if (count === 0) return 0;
        if (count <= 1) return 1;
        if (count <= 3) return 2;
        if (count <= 6) return 3;
        return 4;
    };

    /* ============================================================
       ACTIVITY CURVE
    ============================================================ */

    const activityChartData =
        useMemo(() => {
            if (!dailySolve.length) {
                return [];
            }

            const sorted =
                [...dailySolve].sort(
                    (a, b) =>
                        new Date(
                            a.date,
                        ).getTime() -
                        new Date(
                            b.date,
                        ).getTime(),
                );

            return sorted.map((item) => ({
                date: formatDate(
                    item.date,
                ),
                solved: Number(
                    item.count ?? 0,
                ),
            }));
        }, [dailySolve]);

    /* ============================================================
       PROFILE AVATAR
    ============================================================ */

    const userAvatar =
        (user as any)?.avatar ||
        (user as any)?.image ||
        (user as any)?.profileImage ||
        leetcode?.avatar;

    const initials =
        (user?.name || "User")
            .split(/\s+/)
            .filter(Boolean)
            .map(
                (part) =>
                    part.charAt(0),
            )
            .slice(0, 2)
            .join("")
            .toUpperCase();

    /* ============================================================
       LOADING
    ============================================================ */

    if (dashboardLoading) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-[#040508] text-white">
                <div className="pointer-events-none fixed inset-0">
                    <div className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-[150px]" />
                    <div className="absolute -right-32 top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[160px]" />
                </div>

                <div className="relative z-10 flex min-h-screen items-center justify-center">
                    <div className="flex flex-col items-center">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                            <Loader2 className="h-6 w-6 animate-spin text-violet-300" />
                        </div>

                        <p className="text-base font-semibold text-white">
                            Building your Dykstra profile
                        </p>

                        <p className="mt-2 text-sm text-white/65">
                            Analyzing your preparation data...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /* ============================================================
       MAIN
    ============================================================ */

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#040508] text-white">
            {/* =====================================================
                BACKGROUND
            ===================================================== */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-[12%] -top-[14%] h-[680px] w-[680px] rounded-full bg-violet-600/[0.09] blur-[180px]" />

                <div className="absolute -right-[12%] top-[15%] h-[620px] w-[620px] rounded-full bg-blue-600/[0.075] blur-[190px]" />

                <div className="absolute bottom-[-15%] left-[35%] h-[500px] w-[500px] rounded-full bg-fuchsia-500/[0.035] blur-[170px]" />

                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
                        backgroundSize:
                            "64px 64px",
                    }}
                />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[1420px] px-5 py-6 md:px-8 lg:px-10">
                {/* =================================================
                    TOP BAR
                ================================================= */}

                <div className="mb-8 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            navigate({
                                to: "/dashboard",
                            })
                        }
                        className="group h-10 gap-2 rounded-xl px-3 text-sm text-white/75 hover:bg-white/[0.06] hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />

                        Dashboard
                    </Button>

                    <div className="flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/[0.07] px-4 py-2 text-sm font-medium text-violet-200">
                        <Sparkles className="h-4 w-4 text-violet-300" />

                        Dykstra Profile
                    </div>
                </div>

                {/* =================================================
                    HERO
                ================================================= */}

                <Card className="group relative mb-6 overflow-hidden border-white/[0.09] bg-gradient-to-br from-white/[0.055] via-white/[0.025] to-violet-500/[0.035] shadow-2xl shadow-black/40 backdrop-blur-2xl">
                    <div className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-violet-500/[0.12] blur-[120px] transition-all duration-700 group-hover:bg-violet-500/[0.17]" />

                    <div className="pointer-events-none absolute bottom-[-130px] left-[35%] h-72 w-72 rounded-full bg-blue-500/[0.07] blur-[100px]" />

                    <CardContent className="relative p-7 md:p-9">
                        <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
                            {/* PROFILE */}

                            <div className="flex items-center gap-5">
                                <div className="relative shrink-0">
                                    <div className="h-[88px] w-[88px] rounded-[27px] border border-violet-300/20 bg-gradient-to-br from-violet-500/25 via-blue-500/10 to-white/[0.03] p-[2px] shadow-2xl shadow-violet-950/30">
                                        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[25px] bg-[#090a0f]">
                                            {userAvatar ? (
                                                <img
                                                    src={
                                                        userAvatar
                                                    }
                                                    alt={
                                                        user?.name ||
                                                        "Profile"
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-2xl font-bold text-violet-200">
                                                    {
                                                        initials
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-[#07080b] bg-emerald-500 shadow-lg shadow-emerald-500/30">
                                        <Check className="h-3.5 w-3.5 text-white" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                                            {user?.name ||
                                                "Your Profile"}
                                        </h1>

                                        <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                    </div>

                                    <p className="mt-2 text-sm text-white/70 md:text-base">
                                        {user?.email ||
                                            "Developer profile"}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/[0.08] px-3 py-1.5 text-sm font-medium text-violet-200">
                                            <Code2 className="h-4 w-4" />

                                            DSA Preparation
                                        </span>

                                        {leetcode?.valid && (
                                            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/15 bg-yellow-500/[0.07] px-3 py-1.5 text-sm font-medium text-yellow-200">
                                                <span className="h-2 w-2 rounded-full bg-yellow-400" />

                                                LeetCode connected
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CORE DYKSTRA METRICS */}

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[580px]">
                                <HeroMetric
                                    icon={Code2}
                                    label="Dykstra Solved"
                                    value={solved}
                                    accent="violet"
                                />

                                <HeroMetric
                                    icon={Flame}
                                    label="Current Streak"
                                    value={`${streak}d`}
                                    accent="orange"
                                />

                                <HeroMetric
                                    icon={Target}
                                    label="Readiness"
                                    value={`${readinessScore}%`}
                                    accent="blue"
                                />

                                <HeroMetric
                                    icon={Zap}
                                    label="Longest Streak"
                                    value={`${longestStreak}d`}
                                    accent="emerald"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {dashboardError && (
                    <Card className="mb-6 border-red-400/15 bg-red-500/[0.04]">
                        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-base font-semibold text-white">
                                    Profile analytics could not be loaded
                                </p>

                                <p className="mt-1 text-sm text-white/65">
                                    We couldn't retrieve your current Dykstra preparation data.
                                </p>
                            </div>

                            <Button
                                onClick={
                                    loadDashboard
                                }
                                className="h-10 rounded-xl bg-white/[0.08] text-sm text-white hover:bg-white/[0.12]"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />

                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* =================================================
                    MAIN ANALYSIS
                ================================================= */}

                <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                    {/* RADAR */}

                    <Card className="overflow-hidden border-white/[0.09] bg-white/[0.025] shadow-2xl shadow-black/25">
                        <CardContent className="p-7 md:p-8">
                            <SectionHeading
                                icon={
                                    BarChart3
                                }
                                title="Your DSA Profile"
                                subtitle="A view of where your preparation is strongest based on actual Dykstra practice."
                            />

                            {radarData.length >
                            0 ? (
                                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.8fr]">
                                    <div className="h-[330px] min-h-[330px]">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <RadarChart
                                                data={
                                                    radarData
                                                }
                                            >
                                                <PolarGrid
                                                    stroke="rgba(255,255,255,0.10)"
                                                />

                                                <PolarAngleAxis
                                                    dataKey="topic"
                                                    tick={{
                                                        fill: "#F5F5F5",
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                    }}
                                                />

                                                <PolarRadiusAxis
                                                    angle={
                                                        90
                                                    }
                                                    domain={[
                                                        0,
                                                        100,
                                                    ]}
                                                    tick={{
                                                        fill: "rgba(255,255,255,0.55)",
                                                        fontSize: 11,
                                                    }}
                                                />

                                                <Radar
                                                    name="Strength"
                                                    dataKey="score"
                                                    stroke="#8B5CF6"
                                                    fill="#8B5CF6"
                                                    fillOpacity={
                                                        0.22
                                                    }
                                                    strokeWidth={
                                                        2.5
                                                    }
                                                />

                                                <Tooltip
                                                    content={
                                                        <ChartTooltip />
                                                    }
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="flex flex-col justify-center">
                                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-violet-200">
                                            Skill signals
                                        </p>

                                        <div className="space-y-4">
                                            {radarData
                                                .slice(
                                                    0,
                                                    5,
                                                )
                                                .map(
                                                    (
                                                        item,
                                                    ) => (
                                                        <div
                                                            key={
                                                                item.topic
                                                            }
                                                        >
                                                            <div className="mb-2 flex items-center justify-between">
                                                                <span className="text-sm font-medium text-white">
                                                                    {
                                                                        item.topic
                                                                    }
                                                                </span>

                                                                <span className="text-sm font-bold text-violet-200">
                                                                    {
                                                                        item.score
                                                                    }
                                                                </span>
                                                            </div>

                                                            <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                                                                <div
                                                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-400 transition-all duration-700"
                                                                    style={{
                                                                        width: `${item.score}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <EmptyAnalysis message="Solve a few Dykstra problems to build your DSA profile." />
                            )}
                        </CardContent>
                    </Card>

                    {/* READINESS */}

                    <Card className="overflow-hidden border-blue-400/[0.10] bg-gradient-to-br from-blue-500/[0.055] via-white/[0.025] to-violet-500/[0.035] shadow-2xl shadow-black/25">
                        <CardContent className="p-7 md:p-8">
                            <SectionHeading
                                icon={Target}
                                title="Interview Readiness"
                                subtitle="Your current Dykstra preparation signal."
                            />

                            <div className="mt-7 flex items-center justify-center">
                                <div className="relative flex h-52 w-52 items-center justify-center rounded-full border border-white/[0.08] bg-black/20">
                                    <div
                                        className="absolute inset-3 rounded-full"
                                        style={{
                                            background: `conic-gradient(#8b5cf6 ${readinessScore * 3.6}deg, rgba(255,255,255,0.055) 0deg)`,
                                        }}
                                    />

                                    <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-[#08090d]">
                                        <span className="text-5xl font-bold tracking-tight text-white">
                                            {
                                                readinessScore
                                            }
                                        </span>

                                        <span className="mt-1 text-sm font-medium text-white/70">
                                            out of 100
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-7 rounded-2xl border border-white/[0.08] bg-black/20 p-5 text-center">
                                <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/65">
                                    Current level
                                </p>

                                <p className="mt-2 text-2xl font-bold text-white">
                                    {
                                        readinessLevel
                                    }
                                </p>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <MetricBox
                                    label="Solved"
                                    value={
                                        solved
                                    }
                                />

                                <MetricBox
                                    label="Revision Due"
                                    value={
                                        revisionPending
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* =================================================
                    STRENGTHS + WEAKNESSES
                ================================================= */}

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <StrengthWeaknessCard
                        type="strength"
                        topics={
                            strongestTopics
                        }
                    />

                    <StrengthWeaknessCard
                        type="weakness"
                        topics={
                            weakestTopics
                        }
                    />
                </div>

                {/* =================================================
                    GROWTH / DAILY SOLVING
                ================================================= */}

                <Card className="mb-6 overflow-hidden border-white/[0.09] bg-white/[0.025] shadow-2xl shadow-black/25">
                    <CardContent className="p-7 md:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <SectionHeading
                                icon={
                                    TrendingUp
                                }
                                title="Solving Momentum"
                                subtitle="Your actual Dykstra solving activity over time."
                            />

                            <div className="flex flex-wrap gap-3">
                                <MetricPill
                                    label="Active days"
                                    value={
                                        activityActiveDays
                                    }
                                />

                                <MetricPill
                                    label="Best day"
                                    value={
                                        bestActivityDay
                                    }
                                />
                            </div>
                        </div>

                        {activityChartData.length >
                        0 ? (
                            <div className="mt-7 h-[310px] w-full">
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <AreaChart
                                        data={
                                            activityChartData
                                        }
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -15,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="activityGradient"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#8B5CF6"
                                                    stopOpacity={
                                                        0.38
                                                    }
                                                />

                                                <stop
                                                    offset="100%"
                                                    stopColor="#8B5CF6"
                                                    stopOpacity={
                                                        0
                                                    }
                                                />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            stroke="rgba(255,255,255,0.07)"
                                            vertical={
                                                false
                                            }
                                        />

                                        <XAxis
                                            dataKey="date"
                                            tick={{
                                                fill: "rgba(255,255,255,0.68)",
                                                fontSize: 12,
                                            }}
                                            axisLine={false}
                                            tickLine={
                                                false
                                            }
                                        />

                                        <YAxis
                                            allowDecimals={
                                                false
                                            }
                                            tick={{
                                                fill: "rgba(255,255,255,0.68)",
                                                fontSize: 12,
                                            }}
                                            axisLine={false}
                                            tickLine={
                                                false
                                            }
                                        />

                                        <Tooltip
                                            content={
                                                <ChartTooltip />
                                            }
                                        />

                                        <Area
                                            type="monotone"
                                            dataKey="solved"
                                            name="Problems solved"
                                            stroke="#A78BFA"
                                            strokeWidth={
                                                3
                                            }
                                            fill="url(#activityGradient)"
                                            dot={{
                                                r: 4,
                                                fill: "#A78BFA",
                                                strokeWidth: 0,
                                            }}
                                            activeDot={{
                                                r: 6,
                                            }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <EmptyAnalysis message="Your solving curve will appear here as you solve problems on Dykstra." />
                        )}
                    </CardContent>
                </Card>

                {/* =================================================
                    DIFFICULTY + CONSISTENCY
                ================================================= */}

                <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                    {/* DIFFICULTY */}

                    <Card className="overflow-hidden border-white/[0.09] bg-white/[0.025] shadow-2xl shadow-black/25">
                        <CardContent className="p-7 md:p-8">
                            <SectionHeading
                                icon={
                                    BarChart3
                                }
                                title="Difficulty Progression"
                                subtitle="How your current problem mix is distributed."
                            />

                            {difficultyData.length >
                            0 ? (
                                <>
                                    <div className="mt-6 h-[250px]">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={
                                                        difficultyData
                                                    }
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={
                                                        72
                                                    }
                                                    outerRadius={
                                                        100
                                                    }
                                                    paddingAngle={
                                                        5
                                                    }
                                                    stroke="none"
                                                >
                                                    {difficultyData.map(
                                                        (
                                                            entry,
                                                            index,
                                                        ) => (
                                                            <Cell
                                                                key={`${entry.name}-${index}`}
                                                                fill={
                                                                    index ===
                                                                    0
                                                                        ? "#34D399"
                                                                        : index ===
                                                                            1
                                                                          ? "#F59E0B"
                                                                          : "#F87171"
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </Pie>

                                                <Tooltip
                                                    content={
                                                        <ChartTooltip />
                                                    }
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {difficultyData.map(
                                            (
                                                item,
                                                index,
                                            ) => (
                                                <div
                                                    key={
                                                        item.name
                                                    }
                                                    className="rounded-2xl border border-white/[0.07] bg-black/20 p-4 text-center"
                                                >
                                                    <div
                                                        className={`mx-auto mb-2 h-2.5 w-2.5 rounded-full ${
                                                            index ===
                                                            0
                                                                ? "bg-emerald-400"
                                                                : index ===
                                                                    1
                                                                  ? "bg-amber-400"
                                                                  : "bg-red-400"
                                                        }`}
                                                    />

                                                    <p className="text-sm font-semibold text-white">
                                                        {
                                                            item.value
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-white/65">
                                                        {
                                                            item.name
                                                        }
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-red-400/10 bg-red-500/[0.04] p-4">
                                        <p className="text-sm font-semibold text-white">
                                            Hard problem exposure
                                        </p>

                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-sm text-white/70">
                                                {
                                                    hard
                                                }{" "}
                                                hard problems
                                            </span>

                                            <span className="text-sm font-bold text-red-300">
                                                {
                                                    hardPercentage
                                                }
                                                %
                                            </span>
                                        </div>

                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                                            <div
                                                className="h-full rounded-full bg-red-400"
                                                style={{
                                                    width: `${hardPercentage}%`,
                                                }}
                                            />
                                        </div>

                             <p className="mt-3 text-sm leading-5 text-white/65">
    Your medium exposure is{" "}
    <span className="font-semibold text-white">
        {mediumPercentage}%
    </span>
    . Keep increasing difficulty as your topic confidence improves.
</p>
                                    </div>
                                </>
                            ) : (
                                <EmptyAnalysis message="Difficulty analysis will appear after you solve problems on Dykstra." />
                            )}
                        </CardContent>
                    </Card>

                    {/* HEATMAP */}

                    <Card className="overflow-hidden border-orange-400/[0.08] bg-gradient-to-br from-orange-500/[0.025] via-white/[0.018] to-transparent shadow-2xl shadow-black/25">
                        <CardContent className="p-7 md:p-8">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                                <SectionHeading
                                    icon={
                                        Flame
                                    }
                                    title="Dykstra Consistency"
                                    subtitle="This activity map is powered by problems you actually solved on Dykstra."
                                />

                                <div className="flex items-center gap-3 rounded-2xl border border-orange-400/15 bg-orange-500/[0.06] px-4 py-3">
                                    <Flame className="h-5 w-5 text-orange-400" />

                                    <div>
                                        <p className="text-sm font-medium text-white/65">
                                            Current streak
                                        </p>

                                        <p className="text-xl font-bold text-white">
                                            {
                                                streak
                                            }{" "}
                                            days
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-7 overflow-x-auto pb-2">
                                <div className="min-w-[850px]">
                                    <div className="mb-3 flex justify-end gap-4 text-sm text-white/60">
                                        <span>
                                            Less
                                        </span>

                                        {[0, 1, 2, 3, 4].map(
                                            (
                                                level,
                                            ) => (
                                                <span
                                                    key={
                                                        level
                                                    }
                                                    className={`h-3.5 w-3.5 rounded-[4px] ${
                                                        level ===
                                                        0
                                                            ? "bg-white/[0.045]"
                                                            : level ===
                                                                1
                                                              ? "bg-emerald-500/25"
                                                              : level ===
                                                                  2
                                                                ? "bg-emerald-500/45"
                                                                : level ===
                                                                    3
                                                                  ? "bg-emerald-500/70"
                                                                  : "bg-emerald-400"
                                                    }`}
                                                />
                                            ),
                                        )}

                                        <span>
                                            More
                                        </span>
                                    </div>

                                    <div className="flex gap-1.5">
                                        {activityWeeks.map(
                                            (
                                                week,
                                                weekIndex,
                                            ) => (
                                                <div
                                                    key={
                                                        weekIndex
                                                    }
                                                    className="flex flex-col gap-1.5"
                                                >
                                                    {week.map(
                                                        (
                                                            day,
                                                        ) => {
                                                            const level =
                                                                getActivityLevel(
                                                                    day.count,
                                                                );

                                                            return (
                                                                <div
                                                                    key={
                                                                        day.date
                                                                    }
                                                                    title={`${formatDate(day.date)} · ${day.count} problem${day.count === 1 ? "" : "s"} solved`}
                                                                    className={`h-3.5 w-3.5 rounded-[4px] transition-all duration-200 hover:scale-125 ${
                                                                        level ===
                                                                        0
                                                                            ? "bg-white/[0.045]"
                                                                            : level ===
                                                                                1
                                                                              ? "bg-emerald-500/25"
                                                                              : level ===
                                                                                  2
                                                                                ? "bg-emerald-500/45"
                                                                                : level ===
                                                                                    3
                                                                                  ? "bg-emerald-500/70"
                                                                                  : "bg-emerald-400"
                                                                    }`}
                                                                />
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <MetricBox
                                    label="Problems"
                                    value={
                                        activityTotal
                                    }
                                />

                                <MetricBox
                                    label="Active days"
                                    value={
                                        activityActiveDays
                                    }
                                />

                                <MetricBox
                                    label="Best day"
                                    value={
                                        bestActivityDay
                                    }
                                />

                                <MetricBox
                                    label="Longest streak"
                                    value={`${longestStreak}d`}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* =================================================
                    REVISION + RECENT ACTIVITY
                ================================================= */}

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[0.75fr_1.25fr]">
                    {/* REVISION */}

                    <Card className="overflow-hidden border-violet-400/[0.10] bg-gradient-to-br from-violet-500/[0.045] via-white/[0.025] to-transparent shadow-2xl shadow-black/25">
                        <CardContent className="p-7 md:p-8">
                            <SectionHeading
                                icon={
                                    RefreshCw
                                }
                                title="Revision Health"
                                subtitle="Keeping solved problems from becoming forgotten."
                            />

                            <div className="mt-7 flex items-center gap-5 rounded-2xl border border-white/[0.08] bg-black/20 p-5">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/[0.08]">
                                    <RefreshCw className="h-7 w-7 text-violet-300" />
                                </div>

                                <div>
                                    <p className="text-3xl font-bold text-white">
                                        {
                                            revisionPending
                                        }
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-white/65">
                                        problems currently due
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/20 p-5">
                                {revisionPending >
                                0 ? (
                                    <>
                                        <p className="text-base font-semibold text-white">
                                            Your revision queue needs attention
                                        </p>

                                        <p className="mt-2 text-sm leading-6 text-white/65">
                                            Clear your due problems regularly so your solved count represents retained knowledge, not just completed questions.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-base font-semibold text-white">
                                            Your revision queue is clear
                                        </p>

                                        <p className="mt-2 text-sm leading-6 text-white/65">
                                            Keep following the spaced revision cycle as new problems enter your preparation history.
                                        </p>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* RECENT */}

                    <Card className="overflow-hidden border-white/[0.09] bg-white/[0.025] shadow-2xl shadow-black/25">
                        <CardContent className="p-7 md:p-8">
                            <div className="flex items-center justify-between">
                                <SectionHeading
                                    icon={
                                        Activity
                                    }
                                    title="Recent Dykstra Practice"
                                    subtitle="What you've actually been solving recently."
                                />
                            </div>

                            {recentActivity.length >
                            0 ? (
                                <div className="mt-6 space-y-3">
                                    {recentActivity
                                        .slice(
                                            0,
                                            6,
                                        )
                                        .map(
                                            (
                                                item,
                                                index,
                                            ) => (
                                                <div
                                                    key={`${item.title}-${item.solved_at}-${index}`}
                                                    className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-black/20 p-4 transition-all duration-300 hover:border-violet-400/15 hover:bg-white/[0.025]"
                                                >
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/[0.07]">
                                                        <Code2 className="h-5 w-5 text-violet-300" />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-base font-semibold text-white">
                                                            {
                                                                item.title
                                                            }
                                                        </p>

                                                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                                                            <span className="font-medium capitalize text-violet-200">
                                                                {
                                                                    item.topic
                                                                }
                                                            </span>

                                                            <span className="text-white/30">
                                                                •
                                                            </span>

                                                            <span
                                                                className={`font-medium capitalize ${
                                                                    item.difficulty?.toLowerCase() ===
                                                                    "hard"
                                                                        ? "text-red-300"
                                                                        : item.difficulty?.toLowerCase() ===
                                                                            "medium"
                                                                          ? "text-amber-300"
                                                                          : "text-emerald-300"
                                                                }`}
                                                            >
                                                                {
                                                                    item.difficulty
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 text-right">
                                                        <p className="text-sm font-medium text-white/65">
                                                            {formatRelativeDate(
                                                                item.solved_at,
                                                            )}
                                                        </p>

                                                        <Check className="ml-auto mt-1.5 h-4 w-4 text-emerald-400 opacity-70 transition-opacity group-hover:opacity-100" />
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                </div>
                            ) : (
                                <EmptyAnalysis message="Your recent Dykstra practice will appear here." />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* =================================================
                    FOCUS INSIGHT
                ================================================= */}

                <Card className="mb-6 overflow-hidden border-violet-400/[0.12] bg-gradient-to-r from-violet-500/[0.06] via-white/[0.025] to-blue-500/[0.05] shadow-2xl shadow-black/25">
                    <CardContent className="p-7 md:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-5">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/[0.09]">
                                    <Sparkles className="h-6 w-6 text-violet-300" />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">
                                        Dykstra insight
                                    </p>

                                    {dashboard?.focusTopic?.topic ? (
                                        <>
                                            <h2 className="mt-2 text-2xl font-bold text-white">
                                                Focus on{" "}
                                                <span className="capitalize text-violet-200">
                                                    {
                                                        dashboard
                                                            .focusTopic
                                                            .topic
                                                    }
                                                </span>
                                            </h2>

                                            <p className="mt-2 max-w-2xl text-base leading-7 text-white/70">
                                                Dykstra currently identifies this topic as an area that deserves additional preparation based on your solving history.
                                            </p>
                                        </>
                                    ) : weakestTopics.length >
                                      0 ? (
                                        <>
                                            <h2 className="mt-2 text-2xl font-bold text-white">
                                                Your biggest current gap is{" "}
                                                <span className="text-violet-200">
                                                    {formatTopic(
                                                        weakestTopics[0]
                                                            .topic,
                                                    )}
                                                </span>
                                            </h2>

                                            <p className="mt-2 max-w-2xl text-base leading-7 text-white/70">
                                                Your current topic coverage suggests this is the area that would benefit most from additional practice.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="mt-2 text-2xl font-bold text-white">
                                                Keep building your DSA profile
                                            </h2>

                                            <p className="mt-2 max-w-2xl text-base leading-7 text-white/70">
                                                Solve more problems on Dykstra and this section will become increasingly personalized.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={() =>
                                    navigate({
                                        to: "/dashboard",
                                    })
                                }
                                className="group h-11 shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 text-sm font-semibold shadow-lg shadow-violet-950/30"
                            >
                                Open Dashboard

                                <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* =================================================
                    LEETCODE — SECONDARY
                ================================================= */}

                <Card className="mb-10 overflow-hidden border-yellow-400/[0.08] bg-gradient-to-br from-yellow-500/[0.025] via-white/[0.018] to-transparent shadow-2xl shadow-black/25">
                    <CardContent className="p-7 md:p-8">
                        <button
                            type="button"
                            onClick={() =>
                                setShowLeetCodeDetails(
                                    (value) =>
                                        !value,
                                )
                            }
                            className="flex w-full items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/10 bg-yellow-500/[0.08]">
                                    <span className="text-xl">
                                        🟨
                                    </span>
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-xl font-bold text-white">
                                            External Profile
                                        </h2>

                                        {leetcode?.valid && (
                                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/[0.08] px-3 py-1 text-sm font-medium text-emerald-300">
                                                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                                                Connected
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1.5 text-sm text-white/65">
                                        LeetCode data is available as an external signal — your Dykstra analysis above remains the primary profile.
                                    </p>
                                </div>
                            </div>

                            <ChevronRight
                                className={`h-5 w-5 text-white/55 transition-transform duration-300 ${
                                    showLeetCodeDetails
                                        ? "rotate-90"
                                        : ""
                                }`}
                            />
                        </button>

                        {showLeetCodeDetails && (
                            <div className="mt-7 border-t border-white/[0.07] pt-7">
                                {!leetcode?.valid ? (
                                    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-5">
                                        <p className="text-base font-semibold text-white">
                                            Connect LeetCode
                                        </p>

                                        <p className="mt-1.5 text-sm text-white/65">
                                            Import your external coding profile without making it the center of your Dykstra profile.
                                        </p>

                                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                            <div className="relative flex-1">
                                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-white/45">
                                                    leetcode.com/u/
                                                </span>

                                                <input
                                                    value={
                                                        username
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) => {
                                                        setUsername(
                                                            event
                                                                .target
                                                                .value,
                                                        );

                                                        setLeetcode(
                                                            null,
                                                        );
                                                    }}
                                                    onBlur={() =>
                                                        validateLeetCodeUsername(
                                                            username,
                                                        )
                                                    }
                                                    placeholder="username"
                                                    className="h-12 w-full rounded-xl border border-white/10 bg-black/30 pl-[125px] pr-12 text-sm font-medium text-white outline-none placeholder:text-white/30 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/[0.10]"
                                                />

                                                {checkingUsername && (
                                                    <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-violet-300" />
                                                )}
                                            </div>

                                            <Button
                                                onClick={() =>
                                                    handleConnect()
                                                }
                                                disabled={
                                                    connecting ||
                                                    !username.trim()
                                                }
                                                className="h-12 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-7 text-sm font-semibold"
                                            >
                                                {connecting ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Link2 className="mr-2 h-4 w-4" />
                                                )}

                                                Connect
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <div className="flex flex-col gap-5 rounded-2xl border border-white/[0.07] bg-black/20 p-5 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                                                    {leetcode.avatar ? (
                                                        <img
                                                            src={
                                                                leetcode.avatar
                                                            }
                                                            alt={
                                                                leetcode.username
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <User className="h-6 w-6 text-violet-300" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-base font-semibold text-white">
                                                            {leetcode.realName ||
                                                                leetcode.username}
                                                        </p>

                                                        <Check className="h-4 w-4 text-emerald-400" />
                                                    </div>

                                                    <p className="mt-1 text-sm text-white/60">
                                                        @
                                                        {
                                                            leetcode.username
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        window.open(
                                                            leetcode.profileUrl,
                                                            "_blank",
                                                            "noopener,noreferrer",
                                                        )
                                                    }
                                                    className="h-10 rounded-xl border-white/10 bg-white/[0.025] text-sm text-white hover:bg-white/[0.07]"
                                                >
                                                    <ExternalLink className="mr-2 h-4 w-4" />

                                                    Profile
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    onClick={
                                                        handleSync
                                                    }
                                                    disabled={
                                                        checkingUsername
                                                    }
                                                    className="h-10 rounded-xl border-white/10 bg-white/[0.025] text-sm text-white hover:bg-white/[0.07]"
                                                >
                                                    {checkingUsername ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                    )}

                                                    Refresh
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    onClick={
                                                        handleDisconnect
                                                    }
                                                    disabled={
                                                        disconnecting
                                                    }
                                                    className="h-10 rounded-xl text-sm text-white/65 hover:bg-red-500/10 hover:text-red-300"
                                                >
                                                    {disconnecting ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Unlink className="mr-2 h-4 w-4" />
                                                    )}

                                                    Disconnect
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                            <MetricBox
                                                label="Solved"
                                                value={
                                                    leetcodeStats?.totalSolved ??
                                                    0
                                                }
                                            />

                                            <MetricBox
                                                label="Rating"
                                                value={
                                                    leetcodeStats?.contestRating
                                                        ? Number(
                                                              leetcodeStats.contestRating,
                                                          ).toFixed(
                                                              0,
                                                          )
                                                        : "—"
                                                }
                                            />

                                            <MetricBox
                                                label="Acceptance"
                                                value={
                                                    leetcodeStats?.acceptanceRate !==
                                                    undefined
                                                        ? `${Number(
                                                              leetcodeStats.acceptanceRate,
                                                          ).toFixed(
                                                              1,
                                                          )}%`
                                                        : "—"
                                                }
                                            />

                                            <MetricBox
                                                label="Badges"
                                                value={
                                                    badges.length
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

/* ============================================================
   HERO METRIC
============================================================ */

function HeroMetric({
    icon: Icon,
    label,
    value,
    accent,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    accent:
        | "violet"
        | "orange"
        | "blue"
        | "emerald";
}) {
    const styles = {
        violet: {
            box: "bg-violet-500/[0.08]",
            icon: "text-violet-300",
        },
        orange: {
            box: "bg-orange-500/[0.08]",
            icon: "text-orange-300",
        },
        blue: {
            box: "bg-blue-500/[0.08]",
            icon: "text-blue-300",
        },
        emerald: {
            box: "bg-emerald-500/[0.08]",
            icon: "text-emerald-300",
        },
    };

    const style = styles[accent];

    return (
        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-white/65">
                        {label}
                    </p>

                    <p className="mt-1.5 text-2xl font-bold tracking-tight text-white">
                        {value}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.box}`}
                >
                    <Icon
                        className={`h-5 w-5 ${style.icon}`}
                    />
                </div>
            </div>
        </div>
    );
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
    icon: Icon,
    title,
    subtitle,
}: {
    icon: React.ElementType;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.045]">
                <Icon className="h-5 w-5 text-violet-300" />
            </div>

            <div>
                <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                    {title}
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-white/65 md:text-base">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}

/* ============================================================
   METRIC BOX
============================================================ */

function MetricBox({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
            <p className="text-sm font-medium text-white/60">
                {label}
            </p>

            <p className="mt-1.5 text-xl font-bold text-white md:text-2xl">
                {value}
            </p>
        </div>
    );
}

/* ============================================================
   METRIC PILL
============================================================ */

function MetricPill({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded-xl border border-white/[0.07] bg-black/20 px-4 py-2.5">
            <span className="text-sm font-medium text-white/60">
                {label}
            </span>

            <span className="ml-2 text-sm font-bold text-white">
                {value}
            </span>
        </div>
    );
}

/* ============================================================
   STRENGTH / WEAKNESS
============================================================ */

function StrengthWeaknessCard({
    type,
    topics,
}: {
    type: "strength" | "weakness";
    topics: {
        topic: string;
        count: number;
        signal: number;
        recent: number;
    }[];
}) {
    const isStrength =
        type === "strength";

    return (
        <Card
            className={`overflow-hidden shadow-2xl shadow-black/25 ${
                isStrength
                    ? "border-emerald-400/[0.10] bg-gradient-to-br from-emerald-500/[0.035] via-white/[0.025] to-transparent"
                    : "border-red-400/[0.10] bg-gradient-to-br from-red-500/[0.03] via-white/[0.025] to-transparent"
            }`}
        >
            <CardContent className="p-7 md:p-8">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                            isStrength
                                ? "bg-emerald-500/[0.09]"
                                : "bg-red-500/[0.08]"
                        }`}
                    >
                        {isStrength ? (
                            <TrendingUp className="h-6 w-6 text-emerald-300" />
                        ) : (
                            <TrendingDown className="h-6 w-6 text-red-300" />
                        )}
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {isStrength
                                ? "Your Strengths"
                                : "Your Weaknesses"}
                        </h2>

                        <p className="mt-1 text-sm text-white/65">
                            {isStrength
                                ? "Topics showing the strongest preparation signals."
                                : "Topics that currently need more attention."}
                        </p>
                    </div>
                </div>

                {topics.length > 0 ? (
                    <div className="mt-7 space-y-5">
                        {topics.map(
                            (topic) => (
                                <div
                                    key={
                                        topic.topic
                                    }
                                >
                                    <div className="mb-2.5 flex items-center justify-between">
                                        <div>
                                            <span className="text-base font-semibold capitalize text-white">
                                                {formatTopic(
                                                    topic.topic,
                                                )}
                                            </span>

                                            <span className="ml-2 text-sm font-medium text-white/50">
                                                {
                                                    topic.count
                                                }{" "}
                                                solved
                                            </span>
                                        </div>

                                        <span
                                            className={`text-sm font-bold ${
                                                isStrength
                                                    ? "text-emerald-300"
                                                    : "text-red-300"
                                            }`}
                                        >
                                            {
                                                topic.signal
                                            }
                                        </span>
                                    </div>

                                    <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.07]">
                                        <div
                                            className={`h-full rounded-full ${
                                                isStrength
                                                    ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                                                    : "bg-gradient-to-r from-red-500 to-orange-400"
                                            }`}
                                            style={{
                                                width: `${topic.signal}%`,
                                            }}
                                        />
                                    </div>

                                    <p className="mt-2 text-sm text-white/55">
                                        {topic.recent >
                                        0
                                            ? `${topic.recent} recent practice signal${topic.recent === 1 ? "" : "s"}`
                                            : "Limited recent practice"}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                ) : (
                    <EmptyAnalysis
                        message={
                            isStrength
                                ? "Solve more problems to identify your strongest areas."
                                : "Solve more problems to identify areas that need attention."
                        }
                    />
                )}
            </CardContent>
        </Card>
    );
}

/* ============================================================
   EMPTY
============================================================ */

function EmptyAnalysis({
    message,
}: {
    message: string;
}) {
    return (
        <div className="mt-6 rounded-2xl border border-dashed border-white/[0.10] bg-black/15 px-6 py-12 text-center">
            <Activity className="mx-auto h-7 w-7 text-white/40" />

            <p className="mx-auto mt-4 max-w-md text-base font-medium leading-6 text-white/70">
                {message}
            </p>
        </div>
    );
}

/* ============================================================
   CHART TOOLTIP
============================================================ */

function ChartTooltip({
    active,
    payload,
    label,
}: any) {
    if (
        !active ||
        !payload ||
        !payload.length
    ) {
        return null;
    }

    return (
        <div className="rounded-xl border border-white/[0.10] bg-[#090a0f]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
            {label && (
                <p className="mb-1.5 text-sm font-semibold text-white">
                    {label}
                </p>
            )}

            {payload.map(
                (
                    item: any,
                    index: number,
                ) => (
                    <p
                        key={index}
                        className="text-sm font-medium text-white/75"
                    >
                        {item.name}:{" "}
                        <span className="font-bold text-white">
                            {item.value}
                        </span>
                    </p>
                ),
            )}
        </div>
    );
}