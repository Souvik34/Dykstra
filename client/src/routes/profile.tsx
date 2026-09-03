/* eslint-disable prettier/prettier */

import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  ArrowLeft,
  Award,
  CalendarDays,
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
  Star,
  Target,
  TrendingUp,
  Trophy,
  Unlink,
  User,
  Zap,
} from "lucide-react";

import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import { toast } from "sonner";

import leetcodeService from "@/services/leetcodeService";
import { useAuthStore } from "@/store/auth-store";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

interface LeetCodeCalendarEntry {
  activity_date: string;
  submission_count: number;
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

  calendar?: LeetCodeCalendarEntry[];
}

/* ============================================================
   HELPERS
============================================================ */

function extractData(response: any): LeetCodeData {
  return response?.data?.data || response?.data || {};
}

/**
 * Keeps YYYY-MM-DD dates as dates instead of converting them
 * through UTC with toISOString().
 *
 * This avoids the old heatmap shifting dates depending on
 * the user's timezone.
 */
function normalizeDateKey(value: string | Date) {
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function shiftDate(key: string, amount: number) {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + amount);

  return normalizeDateKey(date);
}

function formatDate(key: string) {
  return parseDateKey(key).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatMonth(key: string) {
  return parseDateKey(key).toLocaleDateString(undefined, {
    month: "short",
  });
}

/* ============================================================
   APPLY BACKEND DATA
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

    setCalendar: React.Dispatch<
      React.SetStateAction<LeetCodeCalendarEntry[]>
    >;

    setConnection: React.Dispatch<
      React.SetStateAction<LeetCodeData["connection"] | null>
    >;
  },
) {
  const {
    setLeetcode,
    setStats,
    setBadges,
    setCalendar,
    setConnection,
  } = setters;

  if (data.connection) {
    setConnection(data.connection);
  }

  const username =
    data.connection?.username || data.profile?.username;

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
      totalSolved: Number(data.stats.total_solved ?? 0),
      easySolved: Number(data.stats.easy_solved ?? 0),
      mediumSolved: Number(data.stats.medium_solved ?? 0),
      hardSolved: Number(data.stats.hard_solved ?? 0),
      totalSubmissions: Number(
        data.stats.total_submissions ?? 0,
      ),
      acceptanceRate: data.stats.acceptance_rate ?? 0,
      contestRating: data.stats.contest_rating ?? null,
    });
  }

  if (Array.isArray(data.badges)) {
    setBadges(data.badges);
  }

  if (Array.isArray(data.calendar)) {
    setCalendar(data.calendar);
  }
}

/* ============================================================
   PAGE
============================================================ */

function ProfilePage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const [leetcode, setLeetcode] =
    useState<LeetCodeProfile | null>(null);

  const [stats, setStats] =
    useState<LeetCodeStats | null>(null);

  const [badges, setBadges] =
    useState<LeetCodeBadge[]>([]);

  const [calendar, setCalendar] =
    useState<LeetCodeCalendarEntry[]>([]);

  const [connection, setConnection] =
    useState<LeetCodeData["connection"] | null>(null);

  const [username, setUsername] = useState("");

  const [checkingUsername, setCheckingUsername] =
    useState(false);

  const [connecting, setConnecting] =
    useState(false);

  const [disconnecting, setDisconnecting] =
    useState(false);

  const [loaded, setLoaded] = useState(false);

  /* ============================================================
     LOAD
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    const loadLeetCode = async () => {
      try {
        const response =
          await leetcodeService.getProfile();

        if (!mounted) return;

        const data = extractData(response);

        applyLeetCodeData(data, {
          setLeetcode,
          setStats,
          setBadges,
          setCalendar,
          setConnection,
        });

        if (data.connection?.username) {
          setUsername(data.connection.username);
        }
      } catch (error) {
        if (!mounted) return;

        setLeetcode(null);
        setStats(null);
        setBadges([]);
        setCalendar([]);
        setConnection(null);
      } finally {
        if (mounted) {
          setLoaded(true);
        }
      }
    };

    loadLeetCode();

    return () => {
      mounted = false;
    };
  }, []);

  /* ============================================================
     AVATAR
  ============================================================ */

  const userAvatar =
    (user as any)?.avatar ||
    (user as any)?.image ||
    (user as any)?.profileImage ||
    leetcode?.avatar;

  const initials = (user?.name || "User")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  /* ============================================================
     VALIDATE
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

      const profile = response.data.data;

      setLeetcode({
        valid: true,
        username:
          profile.username || cleanUsername,
        profileUrl:
          profile.profileUrl ||
          `https://leetcode.com/u/${
            profile.username || cleanUsername
          }`,
        avatar: profile.avatar,
        realName: profile.realName,
        ranking: profile.ranking,
        reputation: profile.reputation,
        starRating: profile.starRating,
      });

      toast.success(
        `@${profile.username || cleanUsername} verified`,
      );
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

  /* ============================================================
     CONNECT
  ============================================================ */

  const handleConnect = async () => {
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      toast.error("Enter your LeetCode username.");
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

      const data = extractData(profileResponse);

      applyLeetCodeData(data, {
        setLeetcode,
        setStats,
        setBadges,
        setCalendar,
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

  /* ============================================================
     DISCONNECT
  ============================================================ */

  const handleDisconnect = async () => {
    setDisconnecting(true);

    try {
      await leetcodeService.disconnectProfile();

      setLeetcode(null);
      setStats(null);
      setBadges([]);
      setCalendar([]);
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

  /* ============================================================
     REFRESH
  ============================================================ */

  const handleSync = async () => {
    setCheckingUsername(true);

    try {
      const response =
        await leetcodeService.getProfile();

      const data = extractData(response);

      applyLeetCodeData(data, {
        setLeetcode,
        setStats,
        setBadges,
        setCalendar,
        setConnection,
      });

      if (data.connection?.username) {
        setUsername(data.connection.username);
      }

      toast.success("LeetCode data refreshed.");
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
     ANALYTICS
  ============================================================ */

  const analytics = useMemo(() => {
    const map = new Map<string, number>();

    calendar.forEach((entry) => {
      const key = normalizeDateKey(
        entry.activity_date,
      );

      if (!key) return;

      map.set(
        key,
        Number(entry.submission_count || 0),
      );
    });

    const totalSubmissions = Array.from(
      map.values(),
    ).reduce((sum, value) => sum + value, 0);

    const activeDays = Array.from(map.values()).filter(
      (value) => value > 0,
    ).length;

    const bestDay = Math.max(
      0,
      ...Array.from(map.values()),
    );

    /* ----------------------------------------------------------
       CURRENT STREAK
    ---------------------------------------------------------- */

    const today = normalizeDateKey(new Date());

    let streak = 0;

    let cursor = today;

    if ((map.get(cursor) || 0) === 0) {
      cursor = shiftDate(cursor, -1);
    }

    while ((map.get(cursor) || 0) > 0) {
      streak += 1;
      cursor = shiftDate(cursor, -1);
    }

    /* ----------------------------------------------------------
       LAST 12 WEEKS
    ---------------------------------------------------------- */

    const weekEnd = parseDateKey(today);

    const dayOfWeek = weekEnd.getDay();

    weekEnd.setDate(
      weekEnd.getDate() - dayOfWeek,
    );

    const weekly = Array.from(
      { length: 12 },
      (_, index) => {
        const end = new Date(weekEnd);

        end.setDate(
          end.getDate() -
            (11 - index) * 7 +
            6,
        );

        const start = new Date(end);

        start.setDate(
          start.getDate() - 6,
        );

        let total = 0;

        for (
          let day = new Date(start);
          day <= end;
          day.setDate(day.getDate() + 1)
        ) {
          total +=
            map.get(normalizeDateKey(day)) || 0;
        }

        return {
          label: start.toLocaleDateString(
            undefined,
            {
              month: "short",
              day: "numeric",
            },
          ),
          value: total,
        };
      },
    );

    /* ----------------------------------------------------------
       WEEKDAY ANALYSIS
    ---------------------------------------------------------- */

    const weekdays = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ];

    const weekdayTotals = weekdays.map(
      (name, index) => {
        let value = 0;

        map.forEach((count, key) => {
          const date = parseDateKey(key);

          if (date.getDay() === index) {
            value += count;
          }
        });

        return {
          name,
          value,
        };
      },
    );

    const maxWeekday = Math.max(
      1,
      ...weekdayTotals.map(
        (item) => item.value,
      ),
    );

    /* ----------------------------------------------------------
       DIFFICULTY
    ---------------------------------------------------------- */

    const easy = stats?.easySolved ?? 0;
    const medium = stats?.mediumSolved ?? 0;
    const hard = stats?.hardSolved ?? 0;

    const solved = stats?.totalSolved ?? 0;

    const easyPercentage =
      solved > 0
        ? (easy / solved) * 100
        : 0;

    const mediumPercentage =
      solved > 0
        ? (medium / solved) * 100
        : 0;

    const hardPercentage =
      solved > 0
        ? (hard / solved) * 100
        : 0;

    /* ----------------------------------------------------------
       COMPETITIVE RADAR
    ---------------------------------------------------------- */

    const acceptance = Number(
      stats?.acceptanceRate ?? 0,
    );

    const rating = Number(
      stats?.contestRating ?? 0,
    );

    const difficultyScore =
      solved > 0
        ? Math.min(
            100,
            ((medium * 1.5 + hard * 2.5) /
              Math.max(1, solved * 2.5)) *
              100,
          )
        : 0;

    const consistencyScore = Math.min(
      100,
      activeDays > 0
        ? (activeDays / 365) * 100
        : 0,
    );

    const volumeScore = Math.min(
      100,
      (solved / 500) * 100,
    );

    const ratingScore = Math.min(
      100,
      Math.max(
        0,
        ((rating - 1000) / 1200) * 100,
      ),
    );

    const radar = [
      {
        label: "Volume",
        value: volumeScore,
      },
      {
        label: "Consistency",
        value: consistencyScore,
      },
      {
        label: "Difficulty",
        value: difficultyScore,
      },
      {
        label: "Acceptance",
        value: Math.min(
          100,
          Math.max(0, acceptance),
        ),
      },
      {
        label: "Rating",
        value: ratingScore,
      },
    ];

    /* ----------------------------------------------------------
       INSIGHTS
    ---------------------------------------------------------- */

    const strongestDay = [...weekdayTotals].sort(
      (a, b) => b.value - a.value,
    )[0];

    const recentWeeks = weekly.slice(-4);

    const previousWeeks = weekly.slice(-8, -4);

    const recentAverage =
      recentWeeks.reduce(
        (sum, item) => sum + item.value,
        0,
      ) / Math.max(1, recentWeeks.length);

    const previousAverage =
      previousWeeks.reduce(
        (sum, item) => sum + item.value,
        0,
      ) / Math.max(1, previousWeeks.length);

    const momentum =
      previousAverage > 0
        ? ((recentAverage -
            previousAverage) /
            previousAverage) *
          100
        : recentAverage > 0
          ? 100
          : 0;

    let insightTitle =
      "Your activity is building steadily.";

    let insightText =
      "Keep the same rhythm and turn consistency into long-term progress.";

    if (momentum >= 20) {
      insightTitle =
        "Your solving momentum is accelerating.";

      insightText =
        "Your recent activity is clearly above your earlier 12-week average.";
    } else if (momentum <= -20) {
      insightTitle =
        "Your recent activity has slowed down.";

      insightText =
        "A few consistent solving sessions this week can quickly bring your momentum back.";
    }

    if (hardPercentage >= 20) {
      insightTitle =
        "You are taking on meaningful difficulty.";

      insightText =
        "A strong hard-problem share suggests you're pushing beyond basic pattern recognition.";
    }

    return {
      map,
      totalSubmissions,
      activeDays,
      bestDay,
      streak,
      weekly,
      weekdayTotals,
      maxWeekday,
      easy,
      medium,
      hard,
      easyPercentage,
      mediumPercentage,
      hardPercentage,
      radar,
      strongestDay,
      momentum,
      insightTitle,
      insightText,
    };
  }, [calendar, stats]);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030407] text-white">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[15%] -top-[18%] h-[650px] w-[650px] rounded-full bg-violet-600/[0.11] blur-[180px]" />

        <div className="absolute -right-[15%] top-[10%] h-[600px] w-[600px] rounded-full bg-blue-600/[0.09] blur-[190px]" />

        <div className="absolute bottom-[-20%] left-[35%] h-[550px] w-[550px] rounded-full bg-fuchsia-500/[0.05] blur-[180px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-5 py-7 md:px-8 lg:px-10">

        {/* ====================================================
            TOP BAR
        ==================================================== */}

        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() =>
              navigate({
                to: "/dashboard",
              })
            }
            className="group gap-2 rounded-xl px-3 text-sm font-medium text-white/75 hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />

            Dashboard
          </Button>

          <div className="flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/[0.08] px-4 py-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-violet-300" />

            Developer Profile
          </div>
        </div>

        {/* ====================================================
            HERO
        ==================================================== */}

        <Card className="group relative mb-6 overflow-hidden border-white/[0.09] bg-gradient-to-br from-white/[0.055] via-white/[0.025] to-violet-500/[0.04] shadow-2xl shadow-black/50 backdrop-blur-2xl">

          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-violet-500/[0.12] blur-[100px]" />

          <div className="pointer-events-none absolute bottom-[-100px] left-[30%] h-60 w-60 rounded-full bg-blue-500/[0.08] blur-[100px]" />

          <CardContent className="relative p-6 md:p-8">

            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-5">

                {/* AVATAR */}

                <div className="relative shrink-0">

                  <div className="h-[88px] w-[88px] overflow-hidden rounded-[26px] border border-violet-300/20 bg-gradient-to-br from-violet-500/30 via-blue-500/15 to-white/[0.04] p-[2px] shadow-xl shadow-violet-950/30">

                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[24px] bg-[#090a0f]">

                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={
                            user?.name ||
                            "Profile"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-violet-200">
                          {initials}
                        </span>
                      )}

                    </div>
                  </div>

                  <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-[#07080b] bg-emerald-500 shadow-lg shadow-emerald-500/30">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>

                </div>

                {/* NAME */}

                <div>

                  <div className="flex flex-wrap items-center gap-2">

                    <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                      {user?.name ||
                        "Your Profile"}
                    </h1>

                    <ShieldCheck className="h-5 w-5 text-emerald-400" />

                  </div>

                  <p className="mt-1 text-base font-medium text-white/70">
                    {user?.email ||
                      "Developer profile"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">

                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.10] px-3 py-1.5 text-sm font-semibold text-violet-200">
                      <Code2 className="h-3.5 w-3.5" />

                      Software Engineer
                    </span>

                    {leetcode?.valid && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/[0.08] px-3 py-1.5 text-sm font-semibold text-emerald-200">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                        LeetCode connected
                      </span>
                    )}

                  </div>

                </div>

              </div>

              {/* HERO METRICS */}

              {leetcode?.valid && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">

                  <HeroMetric
                    label="Solved"
                    value={
                      stats?.totalSolved ?? 0
                    }
                    icon={Code2}
                  />

                  <HeroMetric
                    label="Rating"
                    value={
                      stats?.contestRating
                        ? Number(
                            stats.contestRating,
                          ).toFixed(0)
                        : "—"
                    }
                    icon={Star}
                  />

                  <HeroMetric
                    label="Active Days"
                    value={
                      analytics.activeDays
                    }
                    icon={Activity}
                  />

                  <HeroMetric
                    label="Streak"
                    value={`${analytics.streak}d`}
                    icon={Flame}
                  />

                </div>
              )}

            </div>

          </CardContent>
        </Card>

        {/* ====================================================
            LEETCODE CONNECTION
        ==================================================== */}

        <Card className="mb-8 overflow-hidden border-yellow-400/[0.12] bg-gradient-to-br from-yellow-500/[0.045] via-white/[0.02] to-transparent shadow-xl shadow-black/30">

          <CardContent className="p-6 md:p-7">

            <div className="flex flex-col gap-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/15 bg-yellow-500/[0.09]">
                    <span className="text-xl">
                      🟨
                    </span>
                  </div>

                  <div>

                    <div className="flex items-center gap-2">

                      <h2 className="text-lg font-bold text-white">
                        LeetCode
                      </h2>

                      {leetcode?.valid && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                          Connected
                        </span>
                      )}

                    </div>

                    <p className="mt-1 text-sm font-medium text-white/70">
                      {leetcode?.valid
                        ? "Your coding data is synced with Dykstra."
                        : "Connect your profile to import coding progress."}
                    </p>

                  </div>

                </div>

                {leetcode?.valid && (
                  <div className="flex items-center gap-2 text-sm font-medium text-white/70">

                    <CalendarDays className="h-4 w-4 text-yellow-300" />

                    {connection?.last_synced_at
                      ? `Synced ${new Date(
                          connection.last_synced_at,
                        ).toLocaleDateString()}`
                      : "Synced"}

                  </div>
                )}

              </div>

              {/* INPUT */}

              {!leetcode?.valid && (
                <div className="rounded-2xl border border-white/[0.08] bg-black/25 p-5">

                  <label className="text-sm font-semibold text-white">
                    LeetCode username
                  </label>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">

                    <div className="relative flex-1">

                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-white/60">
                        leetcode.com/u/
                      </span>

                      <input
                        value={username}
                        onChange={(event) => {
                          setUsername(
                            event.target.value,
                          );

                          setLeetcode(null);
                        }}
                        onBlur={() =>
                          validateLeetCodeUsername(
                            username,
                          )
                        }
                        className="h-12 w-full rounded-xl border border-white/10 bg-black/40 pl-[125px] pr-11 text-base font-medium text-white outline-none transition-all placeholder:text-white/30 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                        placeholder="username"
                      />

                      {checkingUsername && (
                        <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-violet-300" />
                      )}

                    </div>

                    <Button
                      onClick={() =>
                        validateLeetCodeUsername(
                          username,
                        )
                      }
                      disabled={
                        checkingUsername ||
                        !username.trim()
                      }
                      className="h-12 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 text-sm font-bold shadow-lg shadow-violet-900/20"
                    >
                      {checkingUsername ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Link2 className="mr-2 h-4 w-4" />
                      )}

                      Verify
                    </Button>

                  </div>

                </div>
              )}

              {/* CONNECTED */}

              {leetcode?.valid && (
                <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-black/25 p-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-4">

                    <div className="h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">

                      {leetcode.avatar ? (
                        <img
                          src={leetcode.avatar}
                          alt={
                            leetcode.username
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User className="h-5 w-5 text-violet-300" />
                        </div>
                      )}

                    </div>

                    <div>

                      <div className="flex items-center gap-2">

                        <p className="text-base font-bold text-white">
                          {leetcode.realName ||
                            leetcode.username}
                        </p>

                        <Check className="h-4 w-4 text-emerald-400" />

                      </div>

                      <p className="mt-1 text-sm font-medium text-white/65">
                        @{leetcode.username}
                      </p>

                    </div>

                  </div>

                  <div className="flex flex-wrap gap-2">

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          leetcode.profileUrl,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      className="h-10 rounded-xl border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white hover:bg-white/[0.08]"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />

                      Profile
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSync}
                      disabled={checkingUsername}
                      className="h-10 rounded-xl border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white hover:bg-white/[0.08]"
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
                      size="sm"
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      className="h-10 rounded-xl px-4 text-sm font-semibold text-white/65 hover:bg-red-500/10 hover:text-red-300"
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
              )}

              {leetcode?.valid && !connection && (
                <div className="border-t border-white/[0.07] pt-4">

                  <Button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="h-11 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 text-sm font-bold"
                  >
                    {connecting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="mr-2 h-4 w-4" />
                    )}

                    Connect LeetCode
                  </Button>

                </div>
              )}

            </div>

          </CardContent>
        </Card>

        {/* ====================================================
            ANALYTICS
        ==================================================== */}

        {leetcode?.valid && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">

            <div className="mb-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/[0.10]">
                  <TrendingUp className="h-5 w-5 text-violet-300" />
                </div>

                <div>

                  <h2 className="text-xl font-bold text-white md:text-2xl">
                    Performance Analytics
                  </h2>

                  <p className="mt-1 text-sm font-medium text-white/65 md:text-base">
                    A visual breakdown of how you are solving, improving and staying consistent.
                  </p>

                </div>

              </div>

            </div>

            {/* ==================================================
                ROW 1
            ================================================== */}

            <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_0.95fr]">

              {/* MOMENTUM */}

              <Card className="overflow-hidden border-white/[0.09] bg-gradient-to-br from-violet-500/[0.055] via-white/[0.025] to-transparent shadow-xl shadow-black/30">

                <CardContent className="p-6 md:p-7">

                  <SectionHeader
                    icon={TrendingUp}
                    iconClass="text-violet-300"
                    iconBg="bg-violet-500/[0.10]"
                    title="Solving Momentum"
                    description="Your submission activity across the last 12 weeks"
                  />

                  <div className="mt-7">

                    <WeeklyMomentumChart
                      data={analytics.weekly}
                    />

                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">

                    <AnalysisMetric
                      label="12 week total"
                      value={analytics.weekly.reduce(
                        (sum, item) =>
                          sum + item.value,
                        0,
                      )}
                    />

                    <AnalysisMetric
                      label="Weekly average"
                      value={Math.round(
                        analytics.weekly.reduce(
                          (sum, item) =>
                            sum + item.value,
                          0,
                        ) / 12,
                      )}
                    />

                    <AnalysisMetric
                      label="Momentum"
                      value={`${analytics.momentum >= 0 ? "+" : ""}${Math.round(analytics.momentum)}%`}
                      positive={
                        analytics.momentum >= 0
                      }
                    />

                  </div>

                </CardContent>

              </Card>

              {/* DIFFICULTY DONUT */}

              <Card className="overflow-hidden border-white/[0.09] bg-gradient-to-br from-blue-500/[0.05] via-white/[0.025] to-transparent shadow-xl shadow-black/30">

                <CardContent className="p-6 md:p-7">

                  <SectionHeader
                    icon={Target}
                    iconClass="text-blue-300"
                    iconBg="bg-blue-500/[0.10]"
                    title="Solving Mix"
                    description="Where your solved problems are concentrated"
                  />

                  <div className="mt-7 flex items-center justify-center">

                    <DifficultyDonut
                      easy={
                        analytics.easy
                      }
                      medium={
                        analytics.medium
                      }
                      hard={
                        analytics.hard
                      }
                      total={
                        stats?.totalSolved ?? 0
                      }
                    />

                  </div>

                  <div className="mt-6 space-y-3">

                    <DifficultyLegend
                      label="Easy"
                      value={analytics.easy}
                      percentage={
                        analytics.easyPercentage
                      }
                      dot="bg-emerald-400"
                      text="text-emerald-300"
                    />

                    <DifficultyLegend
                      label="Medium"
                      value={analytics.medium}
                      percentage={
                        analytics.mediumPercentage
                      }
                      dot="bg-orange-400"
                      text="text-orange-300"
                    />

                    <DifficultyLegend
                      label="Hard"
                      value={analytics.hard}
                      percentage={
                        analytics.hardPercentage
                      }
                      dot="bg-red-400"
                      text="text-red-300"
                    />

                  </div>

                </CardContent>

              </Card>

            </div>

            {/* ==================================================
                ROW 2
            ================================================== */}

            <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">

              {/* RADAR */}

              <Card className="overflow-hidden border-white/[0.09] bg-gradient-to-br from-fuchsia-500/[0.04] via-white/[0.025] to-transparent shadow-xl shadow-black/30">

                <CardContent className="p-6 md:p-7">

                  <SectionHeader
                    icon={Sparkles}
                    iconClass="text-fuchsia-300"
                    iconBg="bg-fuchsia-500/[0.10]"
                    title="Competitive Profile"
                    description="A balanced view of your current coding profile"
                  />

                  <div className="mt-5">

                    <RadarChart
                      values={analytics.radar}
                    />

                  </div>

                </CardContent>

              </Card>

              {/* CONSISTENCY */}

              <Card className="overflow-hidden border-white/[0.09] bg-gradient-to-br from-emerald-500/[0.04] via-white/[0.025] to-transparent shadow-xl shadow-black/30">

                <CardContent className="p-6 md:p-7">

                  <SectionHeader
                    icon={Activity}
                    iconClass="text-emerald-300"
                    iconBg="bg-emerald-500/[0.10]"
                    title="Consistency Pattern"
                    description="When you are most active during the week"
                  />

                  <div className="mt-8">

                    <WeekdayChart
                      data={
                        analytics.weekdayTotals
                      }
                      max={
                        analytics.maxWeekday
                      }
                    />

                  </div>

                  <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/20 p-4">

                    <p className="text-sm font-semibold text-white">
                      Strongest day
                    </p>

                    <div className="mt-2 flex items-end justify-between gap-4">

                      <p className="text-2xl font-bold text-white">
                        {
                          analytics
                            .strongestDay
                            .name
                        }
                      </p>

                      <p className="text-sm font-semibold text-emerald-300">
                        {
                          analytics
                            .strongestDay
                            .value
                        }{" "}
                        submissions
                      </p>

                    </div>

                  </div>

                </CardContent>

              </Card>

            </div>

            {/* ==================================================
                ROW 3 — INSIGHTS
            ================================================== */}

            <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_0.7fr]">

              {/* INSIGHT */}

              <Card className="relative overflow-hidden border-violet-400/[0.14] bg-gradient-to-br from-violet-500/[0.10] via-blue-500/[0.045] to-transparent shadow-xl shadow-violet-950/20">

                <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-500/[0.10] blur-[90px]" />

                <CardContent className="relative p-6 md:p-7">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/[0.12]">
                      <Sparkles className="h-5 w-5 text-violet-300" />
                    </div>

                    <div>

                      <p className="text-sm font-bold uppercase tracking-[0.12em] text-violet-200">
                        Dykstra Insight
                      </p>

                      <h3 className="mt-3 text-xl font-bold text-white md:text-2xl">
                        {analytics.insightTitle}
                      </h3>

                      <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-white/70">
                        {analytics.insightText}
                      </p>

                    </div>

                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

                    <InsightStat
                      icon={Code2}
                      label="Solved"
                      value={
                        stats?.totalSolved ??
                        0
                      }
                    />

                    <InsightStat
                      icon={Flame}
                      label="Streak"
                      value={`${analytics.streak}d`}
                    />

                    <InsightStat
                      icon={Zap}
                      label="Acceptance"
                      value={
                        stats?.acceptanceRate !==
                        undefined
                          ? `${Number(
                              stats.acceptanceRate,
                            ).toFixed(1)}%`
                          : "—"
                      }
                    />

                    <InsightStat
                      icon={Trophy}
                      label="Best day"
                      value={
                        analytics.bestDay
                      }
                    />

                  </div>

                </CardContent>
              </Card>

              {/* IDENTITY */}

              <Card className="overflow-hidden border-white/[0.09] bg-white/[0.025] shadow-xl shadow-black/30">

                <CardContent className="p-6 md:p-7">

                  <SectionHeader
                    icon={User}
                    iconClass="text-blue-300"
                    iconBg="bg-blue-500/[0.10]"
                    title="LeetCode Identity"
                    description="Your public coding profile"
                  />

                  <div className="mt-6 grid grid-cols-2 gap-3">

                    <IdentityMetric
                      label="Username"
                      value={`@${leetcode.username}`}
                    />

                    <IdentityMetric
                      label="Ranking"
                      value={
                        leetcode.ranking
                          ? `#${leetcode.ranking.toLocaleString()}`
                          : "—"
                      }
                    />

                    <IdentityMetric
                      label="Reputation"
                      value={
                        leetcode.reputation ??
                        "—"
                      }
                    />

                    <IdentityMetric
                      label="Stars"
                      value={
                        leetcode.starRating ??
                        "—"
                      }
                    />

                  </div>

                </CardContent>
              </Card>

            </div>

            {/* ==================================================
                CONTRIBUTION MAP
            ================================================== */}

            <Card className="mb-6 overflow-hidden border-white/[0.08] bg-white/[0.02] shadow-xl shadow-black/25">

              <CardContent className="p-6 md:p-7">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                  <SectionHeader
                    icon={CalendarDays}
                    iconClass="text-emerald-300"
                    iconBg="bg-emerald-500/[0.10]"
                    title="Contribution Map"
                    description="Daily solving activity"
                  />

                  <div className="flex flex-wrap gap-3">

                    <MiniPill
                      label="Submissions"
                      value={
                        analytics.totalSubmissions
                      }
                    />

                    <MiniPill
                      label="Active days"
                      value={
                        analytics.activeDays
                      }
                    />

                    <MiniPill
                      label="Best day"
                      value={
                        analytics.bestDay
                      }
                    />

                  </div>

                </div>

                <div className="mt-7">

                  <LeetCodeHeatmap
                    calendar={calendar}
                  />

                </div>

              </CardContent>

            </Card>

            {/* ==================================================
                ACHIEVEMENTS
            ================================================== */}

            <Card className="mb-8 overflow-hidden border-yellow-400/[0.09] bg-gradient-to-br from-yellow-500/[0.03] via-white/[0.018] to-transparent shadow-xl shadow-black/25">

              <CardContent className="p-6 md:p-7">

                <div className="mb-6 flex items-center justify-between">

                  <SectionHeader
                    icon={Award}
                    iconClass="text-yellow-300"
                    iconBg="bg-yellow-500/[0.09]"
                    title="Achievements"
                    description="Milestones earned on LeetCode"
                  />

                  <span className="rounded-full border border-yellow-400/15 bg-yellow-500/[0.07] px-3 py-1.5 text-sm font-semibold text-yellow-200">
                    {badges.length} badges
                  </span>

                </div>

                {badges.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

                    {badges.map(
                      (badge, index) => (
                        <BadgeCard
                          key={`${badge.name}-${badge.earned_at}-${index}`}
                          badge={badge}
                          index={index}
                        />
                      ),
                    )}

                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/[0.09] py-12 text-center">

                    <Award className="mx-auto mb-3 h-8 w-8 text-white/35" />

                    <p className="text-base font-semibold text-white">
                      No badges found.
                    </p>

                  </div>
                )}

              </CardContent>

            </Card>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <Card className="mb-10 overflow-hidden border-violet-400/[0.10] bg-gradient-to-r from-violet-500/[0.055] via-white/[0.018] to-blue-500/[0.04]">

              <CardContent className="p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/[0.10]">
                      <Sparkles className="h-5 w-5 text-violet-300" />
                    </div>

                    <div>

                      <h3 className="text-base font-bold text-white">
                        Dykstra × LeetCode
                      </h3>

                      <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-white/65">
                        Your coding profile is connected and ready for deeper progress analysis and future recommendations.
                      </p>

                    </div>

                  </div>

                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate({
                        to: "/dashboard",
                      })
                    }
                    className="h-10 shrink-0 rounded-xl border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-white hover:bg-white/[0.08]"
                  >
                    Dashboard

                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>

                </div>

              </CardContent>
            </Card>

          </div>
        )}

        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {!leetcode?.valid && loaded && (
          <Card className="border-white/[0.09] bg-white/[0.025] shadow-xl shadow-black/30">

            <CardContent className="flex flex-col items-center justify-center px-6 py-24 text-center">

              <div className="relative mb-6">

                <div className="absolute inset-0 rounded-3xl bg-violet-500/10 blur-2xl" />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-400/15 bg-violet-500/[0.08]">

                  <Code2 className="h-8 w-8 text-violet-300" />

                </div>

              </div>

              <h2 className="text-2xl font-bold text-white">
                Connect your LeetCode profile
              </h2>

              <p className="mt-3 max-w-lg text-base font-medium leading-7 text-white/65">
                Bring your solving history, statistics, achievements and activity into Dykstra.
              </p>

            </CardContent>

          </Card>
        )}

      </div>
    </div>
  );
}

/* ============================================================
   HERO METRIC
============================================================ */

function HeroMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="min-w-[105px] rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-4">

      <div className="flex items-center justify-center gap-2">

        <Icon className="h-4 w-4 text-violet-300" />

        <span className="text-sm font-semibold text-white/65">
          {label}
        </span>

      </div>

      <p className="mt-2 text-center text-2xl font-bold tracking-tight text-white">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  icon: Icon,
  iconClass,
  iconBg,
  title,
  description,
}: {
  icon: React.ElementType;
  iconClass: string;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Icon className={`h-5 w-5 ${iconClass}`} />
      </div>

      <div>

        <h2 className="text-lg font-bold text-white md:text-xl">
          {title}
        </h2>

        <p className="mt-1 text-sm font-medium text-white/65">
          {description}
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   ANALYSIS METRIC
============================================================ */

function AnalysisMetric({
  label,
  value,
  positive,
}: {
  label: string;
  value: string | number;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3">

      <p className="text-sm font-medium text-white/60">
        {label}
      </p>

      <p
        className={`mt-1 text-xl font-bold ${
          positive === undefined
            ? "text-white"
            : positive
              ? "text-emerald-300"
              : "text-red-300"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   INSIGHT STAT
============================================================ */

function InsightStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/25 p-3">

      <div className="flex items-center gap-2">

        <Icon className="h-4 w-4 text-violet-300" />

        <span className="text-sm font-medium text-white/60">
          {label}
        </span>

      </div>

      <p className="mt-2 text-xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   IDENTITY
============================================================ */

function IdentityMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">

      <p className="text-sm font-semibold text-white/60">
        {label}
      </p>

      <p className="mt-2 truncate text-base font-bold text-white">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   MINI PILL
============================================================ */

function MiniPill({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2">

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
   DIFFICULTY LEGEND
============================================================ */

function DifficultyLegend({
  label,
  value,
  percentage,
  dot,
  text,
}: {
  label: string;
  value: number;
  percentage: number;
  dot: string;
  text: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">

      <div className="flex items-center gap-3">

        <span
          className={`h-2.5 w-2.5 rounded-full ${dot}`}
        />

        <span className="text-sm font-semibold text-white">
          {label}
        </span>

      </div>

      <div className="flex items-center gap-3">

        <span className="text-base font-bold text-white">
          {value}
        </span>

        <span
          className={`text-sm font-bold ${text}`}
        >
          {percentage.toFixed(0)}%
        </span>

      </div>

    </div>
  );
}

/* ============================================================
   WEEKLY MOMENTUM CHART
============================================================ */

function WeeklyMomentumChart({
  data,
}: {
  data: {
    label: string;
    value: number;
  }[];
}) {
  const width = 900;
  const height = 300;

  const paddingLeft = 48;
  const paddingRight = 24;
  const paddingTop = 28;
  const paddingBottom = 42;

  const innerWidth =
    width - paddingLeft - paddingRight;

  const innerHeight =
    height - paddingTop - paddingBottom;

  const max = Math.max(
    1,
    ...data.map((item) => item.value),
  );

  const points = data.map(
    (item, index) => {
      const x =
        paddingLeft +
        (index /
          Math.max(1, data.length - 1)) *
          innerWidth;

      const y =
        paddingTop +
        innerHeight -
        (item.value / max) *
          innerHeight;

      return {
        x,
        y,
        ...item,
      };
    },
  );

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
    )
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? paddingLeft} ${
    paddingTop + innerHeight
  } L ${points[0]?.x ?? paddingLeft} ${
    paddingTop + innerHeight
  } Z`;

  const gridValues = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full overflow-hidden">

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label="Weekly submission momentum"
      >

        <defs>

          <linearGradient
            id="momentumArea"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#8b5cf6"
              stopOpacity="0.28"
            />

            <stop
              offset="100%"
              stopColor="#8b5cf6"
              stopOpacity="0"
            />
          </linearGradient>

          <linearGradient
            id="momentumLine"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop
              offset="0%"
              stopColor="#8b5cf6"
            />

            <stop
              offset="100%"
              stopColor="#60a5fa"
            />
          </linearGradient>

        </defs>

        {gridValues.map(
          (ratio) => {
            const y =
              paddingTop +
              innerHeight -
              ratio * innerHeight;

            return (
              <line
                key={ratio}
                x1={paddingLeft}
                x2={width - paddingRight}
                y1={y}
                y2={y}
                stroke="white"
                strokeOpacity="0.07"
                strokeDasharray="4 7"
              />
            );
          },
        )}

        <path
          d={areaPath}
          fill="url(#momentumArea)"
        />

        <path
          d={linePath}
          fill="none"
          stroke="url(#momentumLine)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map(
          (point, index) => (
            <g key={index}>

              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="#08090d"
                stroke="#a78bfa"
                strokeWidth="3"
              />

              {index ===
                points.length - 1 && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="10"
                  fill="none"
                  stroke="#a78bfa"
                  strokeOpacity="0.25"
                  strokeWidth="5"
                />
              )}

              <text
                x={point.x}
                y={
                  paddingTop +
                  innerHeight +
                  30
                }
                textAnchor="middle"
                fill="white"
                fillOpacity="0.6"
                fontSize="13"
                fontWeight="600"
              >
                {point.label}
              </text>

            </g>
          ),
        )}

        <text
          x={paddingLeft - 12}
          y={paddingTop + 5}
          textAnchor="end"
          fill="white"
          fillOpacity="0.55"
          fontSize="12"
          fontWeight="600"
        >
          {max}
        </text>

        <text
          x={paddingLeft - 12}
          y={
            paddingTop +
            innerHeight +
            4
          }
          textAnchor="end"
          fill="white"
          fillOpacity="0.55"
          fontSize="12"
          fontWeight="600"
        >
          0
        </text>

      </svg>

    </div>
  );
}

/* ============================================================
   DIFFICULTY DONUT
============================================================ */

function DifficultyDonut({
  easy,
  medium,
  hard,
  total,
}: {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}) {
  const radius = 82;
  const circumference =
    2 * Math.PI * radius;

  const values = [
    {
      value: easy,
      color: "#34d399",
    },
    {
      value: medium,
      color: "#fb923c",
    },
    {
      value: hard,
      color: "#f87171",
    },
  ];

  let offset = 0;

  return (
    <div className="relative h-[230px] w-[230px]">

      <svg
        viewBox="0 0 220 220"
        className="h-full w-full -rotate-90"
      >

        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="white"
          strokeOpacity="0.06"
          strokeWidth="22"
        />

        {values.map(
          (item, index) => {
            const percentage =
              total > 0
                ? item.value / total
                : 0;

            const length =
              percentage *
              circumference;

            const currentOffset =
              -offset;

            offset += length;

            return (
              <circle
                key={index}
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="22"
                strokeLinecap="round"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={
                  currentOffset
                }
              />
            );
          },
        )}

      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">

        <p className="text-4xl font-bold text-white">
          {total}
        </p>

        <p className="mt-1 text-sm font-semibold text-white/60">
          solved
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   RADAR
============================================================ */

function RadarChart({
  values,
}: {
  values: {
    label: string;
    value: number;
  }[];
}) {
  const center = 180;
  const radius = 105;

  const levels = [20, 40, 60, 80, 100];

  const getPoint = (
    index: number,
    value: number,
  ) => {
    const angle =
      -Math.PI / 2 +
      (index / values.length) *
        Math.PI *
        2;

    const distance =
      (value / 100) * radius;

    return {
      x:
        center +
        Math.cos(angle) *
          distance,
      y:
        center +
        Math.sin(angle) *
          distance,
    };
  };

  const getGridPoint = (
    index: number,
    ratio: number,
  ) => {
    const angle =
      -Math.PI / 2 +
      (index / values.length) *
        Math.PI *
        2;

    const distance =
      ratio * radius;

    return {
      x:
        center +
        Math.cos(angle) *
          distance,
      y:
        center +
        Math.sin(angle) *
          distance,
    };
  };

  const gridPolygon = (
    ratio: number,
  ) =>
    values
      .map((_, index) => {
        const point =
          getGridPoint(
            index,
            ratio,
          );

        return `${point.x},${point.y}`;
      })
      .join(" ");

  const dataPolygon = values
    .map((item, index) => {
      const point = getPoint(
        index,
        item.value,
      );

      return `${point.x},${point.y}`;
    })
    .join(" ");

  return (
    <div className="mx-auto w-full max-w-[430px]">

      <svg
        viewBox="0 0 360 360"
        className="h-auto w-full"
        role="img"
        aria-label="Competitive profile radar chart"
      >

        {levels.map(
          (level) => (
            <polygon
              key={level}
              points={gridPolygon(
                level / 100,
              )}
              fill="none"
              stroke="white"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
          ),
        )}

        {values.map(
          (_, index) => {
            const point =
              getGridPoint(
                index,
                1,
              );

            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                stroke="white"
                strokeOpacity="0.08"
              />
            );
          },
        )}

        <polygon
          points={dataPolygon}
          fill="#8b5cf6"
          fillOpacity="0.22"
          stroke="#a78bfa"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {values.map(
          (item, index) => {
            const point = getPoint(
              index,
              item.value,
            );

            const labelPoint =
              getGridPoint(
                index,
                1.22,
              );

            return (
              <g key={item.label}>

                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#08090d"
                  stroke="#c4b5fd"
                  strokeWidth="3"
                />

                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fillOpacity="0.85"
                  fontSize="13"
                  fontWeight="700"
                >
                  {item.label}
                </text>

              </g>
            );
          },
        )}

      </svg>

    </div>
  );
}

/* ============================================================
   WEEKDAY CHART
============================================================ */

function WeekdayChart({
  data,
  max,
}: {
  data: {
    name: string;
    value: number;
  }[];
  max: number;
}) {
  return (
    <div className="space-y-4">

      {data.map((item) => {

        const width =
          (item.value / max) *
          100;

        return (
          <div key={item.name}>

            <div className="mb-2 flex items-center justify-between">

              <span className="text-sm font-bold text-white">
                {item.name}
              </span>

              <span className="text-sm font-bold text-white/70">
                {item.value}
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">

              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700"
                style={{
                  width: `${width}%`,
                }}
              />

            </div>

          </div>
        );
      })}

    </div>
  );
}

/* ============================================================
   BADGE
============================================================ */

function BadgeCard({
  badge,
  index,
}: {
  badge: LeetCodeBadge;
  index: number;
}) {
  return (
    <div
      className="group relative min-h-[145px] overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-black/25 p-4 text-center transition-all duration-500 hover:-translate-y-1 hover:border-yellow-400/20 hover:shadow-xl hover:shadow-yellow-500/[0.07]"
      style={{
        animationDelay: `${index * 40}ms`,
      }}
    >

      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-yellow-400/[0.08] blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col items-center justify-center">

        {badge.icon ? (
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-black/20">

            <img
              src={badge.icon}
              alt={badge.name}
              className="h-11 w-11 object-contain drop-shadow-lg transition-all duration-500 group-hover:scale-110"
            />

          </div>
        ) : (
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/[0.08]">

            <Award className="h-7 w-7 text-yellow-300" />

          </div>
        )}

        <p className="line-clamp-2 text-sm font-bold leading-5 text-white">
          {badge.name}
        </p>

        {badge.earned_at && (
          <p className="mt-2 text-sm font-medium text-white/55">
            {new Date(
              badge.earned_at,
            ).toLocaleDateString(
              undefined,
              {
                month: "short",
                year: "numeric",
              },
            )}
          </p>
        )}

      </div>

    </div>
  );
}

/* ============================================================
   HEATMAP
============================================================ */

function LeetCodeHeatmap({
  calendar,
}: {
  calendar: LeetCodeCalendarEntry[];
}) {
  const map = useMemo(() => {
    const result = new Map<
      string,
      number
    >();

    calendar.forEach((entry) => {
      const key = normalizeDateKey(
        entry.activity_date,
      );

      if (!key) return;

      result.set(
        key,
        Number(
          entry.submission_count || 0,
        ),
      );
    });

    return result;
  }, [calendar]);

  const weeks = useMemo(() => {
    const today =
      normalizeDateKey(
        new Date(),
      );

    const end =
      parseDateKey(today);

    const day =
      end.getDay();

    end.setDate(
      end.getDate() +
        (6 - day),
    );

    const start =
      new Date(end);

    start.setDate(
      start.getDate() -
        364,
    );

    const startDay =
      start.getDay();

    start.setDate(
      start.getDate() -
        startDay,
    );

    const result: {
      date: string;
      count: number;
    }[][] = [];

    let cursor =
      new Date(start);

    while (
      cursor <= end
    ) {
      const week: {
        date: string;
        count: number;
      }[] = [];

      for (
        let dayIndex = 0;
        dayIndex < 7;
        dayIndex++
      ) {
        const key =
          normalizeDateKey(
            cursor,
          );

        week.push({
          date: key,
          count:
            map.get(key) || 0,
        });

        cursor.setDate(
          cursor.getDate() + 1,
        );
      }

      result.push(week);
    }

    return result;
  }, [map]);

  const getLevel = (
    count: number,
  ) => {
    if (count === 0) return 0;
    if (count <= 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;

    return 4;
  };

  const getCellClass = (
    level: number,
  ) => {
    switch (level) {
      case 1:
        return "bg-emerald-500/25";

      case 2:
        return "bg-emerald-500/45";

      case 3:
        return "bg-emerald-500/70";

      case 4:
        return "bg-emerald-400";

      default:
        return "bg-white/[0.055]";
    }
  };

  const monthLabels =
    useMemo(() => {
      const labels: {
        label: string;
        week: number;
      }[] = [];

      let lastMonth = "";

      weeks.forEach(
        (
          week,
          weekIndex,
        ) => {
          const key =
            week[0]?.date;

          if (!key) return;

          const month =
            formatMonth(key);

          if (
            month !== lastMonth
          ) {
            labels.push({
              label: month,
              week: weekIndex,
            });

            lastMonth =
              month;
          }
        },
      );

      return labels;
    }, [weeks]);

  return (
    <div className="w-full overflow-x-auto pb-2">

      <div className="min-w-[820px]">

        {/* MONTHS */}

        <div className="mb-3 grid grid-cols-[42px_1fr]">

          <div />

          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
            }}
          >

            {weeks.map(
              (_, index) => {
                const month =
                  monthLabels.find(
                    (item) =>
                      item.week ===
                      index,
                  );

                return (
                  <div
                    key={index}
                    className="text-sm font-semibold text-white/65"
                  >
                    {month?.label ||
                      ""}
                  </div>
                );
              },
            )}

          </div>
        </div>

        {/* GRID */}

        <div className="grid grid-cols-[42px_1fr]">

          <div className="mr-3 grid grid-rows-7 text-sm font-semibold text-white/60">

            <span />

            <span className="flex items-center">
              Mon
            </span>

            <span />

            <span className="flex items-center">
              Wed
            </span>

            <span />

            <span className="flex items-center">
              Fri
            </span>

            <span />

          </div>

          <div
            className="grid w-full gap-[4px]"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
            }}
          >

            {weeks.map(
              (
                week,
                weekIndex,
              ) => (
                <div
                  key={
                    weekIndex
                  }
                  className="grid grid-rows-7 gap-[4px]"
                >

                  {week.map(
                    (day) => {

                      const level =
                        getLevel(
                          day.count,
                        );

                      return (
                        <div
                          key={
                            day.date
                          }
                          title={`${formatDate(day.date)} · ${day.count} submissions`}
                          className={`aspect-square w-full max-w-[16px] justify-self-center rounded-[4px] ${getCellClass(level)} transition-all duration-150 hover:z-20 hover:scale-150 hover:ring-2 hover:ring-white/30`}
                        />
                      );
                    },
                  )}

                </div>
              ),
            )}

          </div>

        </div>

        {/* LEGEND */}

        <div className="mt-5 flex items-center justify-end gap-2 text-sm font-semibold text-white/60">

          <span>
            Less
          </span>

          {[0, 1, 2, 3, 4].map(
            (level) => (
              <div
                key={level}
                className={`h-3 w-3 rounded-[3px] ${getCellClass(level)}`}
              />
            ),
          )}

          <span>
            More
          </span>

        </div>

      </div>

    </div>
  );
}