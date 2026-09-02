/* eslint-disable prettier/prettier */

import { useEffect, useState } from "react";

import {
    Bell,
    Check,
    ChevronDown,
    Copy,
    Flame,
    LogOut,
    UserRound,
} from "lucide-react";

import { useNavigate } from "@tanstack/react-router";

import { SidebarTrigger } from "@/components/ui/sidebar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import { useAuthStore } from "@/store/auth-store";

import notificationService, {
    Notification,
} from "@/services/notificationService";

export function Topbar() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const navigate = useNavigate();

    const [copied, setCopied] = useState(false);

    const [notifications, setNotifications] = useState<
        Notification[]
    >([]);

    const [unreadCount, setUnreadCount] = useState(0);

    const [notificationsLoading, setNotificationsLoading] =
        useState(false);

    const [
        emailNotificationsEnabled,
        setEmailNotificationsEnabled,
    ] = useState(false);

    const [
        emailNotificationsLoading,
        setEmailNotificationsLoading,
    ] = useState(false);

    /*
    ============================================================
    USER STREAK
    ============================================================
    */

    const userWithStreak = user as
        | {
              streak?: number;
              currentStreak?: number;
              current_streak?: number;
          }
        | null;

    const streak =
        userWithStreak?.current_streak ??
        userWithStreak?.currentStreak ??
        userWithStreak?.streak ??
        0;

    /*
    ============================================================
    FETCH NOTIFICATIONS
    ============================================================
    */

    const fetchNotifications = async () => {
        try {
            setNotificationsLoading(true);

            const data = await notificationService.getAll();

            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error(
                "Failed to fetch notifications:",
                error
            );
        } finally {
            setNotificationsLoading(false);
        }
    };

    /*
    ============================================================
    FETCH EMAIL NOTIFICATION PREFERENCE
    ============================================================
    */

    const fetchEmailPreference = async () => {
        try {
            const preference =
                await notificationService.getRevisionReminderPreference();

            setEmailNotificationsEnabled(
                preference.revision_reminder_enabled
            );
        } catch (error) {
            console.error(
                "Failed to fetch email notification preference:",
                error
            );
        }
    };

    useEffect(() => {
        if (!user) return;

        fetchNotifications();
        fetchEmailPreference();
    }, [user]);

    /*
    ============================================================
    TOGGLE EMAIL NOTIFICATIONS
    ============================================================
    */

    const handleEmailNotificationsToggle = async () => {
        if (emailNotificationsLoading) return;

        const nextValue = !emailNotificationsEnabled;

        try {
            setEmailNotificationsLoading(true);

            await notificationService.setRevisionReminderPreference(
                nextValue
            );

            setEmailNotificationsEnabled(nextValue);
        } catch (error) {
            console.error(
                "Failed to update email notification preference:",
                error
            );
        } finally {
            setEmailNotificationsLoading(false);
        }
    };

    /*
    ============================================================
    MARK SINGLE NOTIFICATION AS READ
    ============================================================
    */

    const handleNotificationClick = async (
        notification: Notification
    ) => {
        if (notification.read_at) return;

        try {
            await notificationService.markRead(
                notification.id
            );

            setNotifications((current) =>
                current.map((item) =>
                    item.id === notification.id
                        ? {
                              ...item,
                              read_at:
                                  new Date().toISOString(),
                          }
                        : item
                )
            );

            setUnreadCount((current) =>
                Math.max(0, current - 1)
            );
        } catch (error) {
            console.error(
                "Failed to mark notification as read:",
                error
            );
        }
    };

    /*
    ============================================================
    MARK ALL NOTIFICATIONS AS READ
    ============================================================
    */

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return;

        try {
            await notificationService.markAllRead();

            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    read_at:
                        notification.read_at ||
                        new Date().toISOString(),
                }))
            );

            setUnreadCount(0);
        } catch (error) {
            console.error(
                "Failed to mark all notifications as read:",
                error
            );
        }
    };

    /*
    ============================================================
    FORMAT NOTIFICATION TIME
    ============================================================
    */

    const formatNotificationTime = (
        createdAt: string
    ) => {
        const date = new Date(createdAt);
        const now = new Date();

        const diff =
            now.getTime() - date.getTime();

        const minutes = Math.floor(
            diff / (1000 * 60)
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

        return date.toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "short",
            }
        );
    };

    /*
    ============================================================
    USER INITIALS
    ============================================================
    */

    const initials =
        user?.name
            ?.trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part.charAt(0))
            .slice(0, 2)
            .join("")
            .toUpperCase() || "U";

    /*
    ============================================================
    LEETCODE PROFILE IMAGE
    ============================================================
    */

    const leetcodeProfile = user as
        | {
              leetcode?: {
                  avatar?: string | null;
                  avatarUrl?: string | null;
                  profile?: {
                      avatar?: string | null;
                      avatarUrl?: string | null;
                  } | null;
              } | null;

              leetcodeProfile?: {
                  avatar?: string | null;
                  avatarUrl?: string | null;
              } | null;

              leetcode_profile?: {
                  avatar?: string | null;
                  avatar_url?: string | null;
              } | null;
          }
        | null;

    const leetcodeAvatar =
        leetcodeProfile?.leetcode?.avatar ??
        leetcodeProfile?.leetcode?.avatarUrl ??
        leetcodeProfile?.leetcode?.profile?.avatar ??
        leetcodeProfile?.leetcode?.profile?.avatarUrl ??
        leetcodeProfile?.leetcodeProfile?.avatar ??
        leetcodeProfile?.leetcodeProfile?.avatarUrl ??
        leetcodeProfile?.leetcode_profile?.avatar ??
        leetcodeProfile?.leetcode_profile?.avatar_url ??
        null;

    /*
    ============================================================
    COPY EMAIL
    ============================================================
    */

    const copyEmail = async () => {
        if (!user?.email) return;

        try {
            await navigator.clipboard.writeText(
                user.email
            );

            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error(
                "Failed to copy email:",
                error
            );
        }
    };

    /*
    ============================================================
    LOGOUT
    ============================================================
    */

    const handleLogout = () => {
        logout();

        navigate({
            to: "/login",
        });
    };

    return (
        <header
            className="
                sticky
                top-0
                z-40
                h-14
                w-full
                border-b
                border-white/[0.10]
                bg-background/80
                backdrop-blur-2xl
                supports-[backdrop-filter]:bg-background/65
            "
        >
            <div
                className="
                    flex
                    h-full
                    w-full
                    items-center
                    px-4
                    sm:px-6
                "
            >
                {/* =================================================
                    SIDEBAR
                ================================================= */}

                <SidebarTrigger
                    className="
                        h-9
                        w-9
                        rounded-xl
                        text-zinc-300
                        transition-all
                        duration-200
                        hover:bg-white/[0.07]
                        hover:text-white
                        active:scale-95
                    "
                />

                {/* =================================================
                    RIGHT ACTIONS
                ================================================= */}

                <div
                    className="
                        ml-auto
                        flex
                        items-center
                        gap-1.5
                    "
                >
                    {/* =================================================
                        STREAK
                    ================================================= */}

                    {streak > 0 && (
                        <div
                            className="
                                group
                                flex
                                h-9
                                items-center
                                gap-1.5
                                rounded-xl
                                px-2.5
                                transition-all
                                duration-200
                                hover:bg-white/[0.06]
                            "
                            title={`${streak} day streak`}
                        >
                            <Flame
                                className="
                                    h-[18px]
                                    w-[18px]
                                    fill-orange-500
                                    text-orange-500
                                    drop-shadow-[0_0_6px_rgba(249,115,22,0.45)]
                                    transition-transform
                                    duration-200
                                    group-hover:scale-110
                                    animate-[pulse_1.8s_ease-in-out_infinite]
                                "
                            />

                            <span
                                className="
                                    min-w-[14px]
                                    text-center
                                    text-sm
                                    font-semibold
                                    leading-none
                                    text-zinc-200
                                "
                            >
                                {streak}
                            </span>
                        </div>
                    )}

                    {/* =================================================
                        NOTIFICATIONS
                    ================================================= */}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="Notifications"
                                className="
                                    group
                                    relative
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-transparent
                                    text-zinc-400
                                    outline-none
                                    transition-all
                                    duration-200
                                    hover:border-white/[0.08]
                                    hover:bg-white/[0.06]
                                    hover:text-white
                                    focus-visible:ring-2
                                    focus-visible:ring-white/[0.18]
                                    active:scale-95
                                "
                                onClick={() => {
                                    if (
                                        !notificationsLoading
                                    ) {
                                        fetchNotifications();
                                    }
                                }}
                            >
                                <Bell
                                    className="
                                        h-[18px]
                                        w-[18px]
                                        transition-transform
                                        duration-200
                                        group-hover:scale-105
                                    "
                                />

                                {unreadCount > 0 && (
                                    <span
                                        className="
                                            absolute
                                            -right-1
                                            -top-1
                                            flex
                                            min-h-4
                                            min-w-4
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-violet-500
                                            px-1
                                            text-[9px]
                                            font-bold
                                            leading-none
                                            text-white
                                            ring-2
                                            ring-background
                                        "
                                    >
                                        {unreadCount > 9
                                            ? "9+"
                                            : unreadCount}
                                    </span>
                                )}
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            sideOffset={10}
                            className="
                                w-[360px]
                                max-w-[calc(100vw-24px)]
                                overflow-hidden
                                rounded-2xl
                                border
                                border-white/[0.11]
                                bg-zinc-950/[0.97]
                                p-1.5
                                shadow-[0_24px_70px_rgba(0,0,0,0.60)]
                                backdrop-blur-2xl
                                data-[state=open]:animate-in
                                data-[state=open]:fade-in-0
                                data-[state=open]:zoom-in-95
                                data-[state=closed]:animate-out
                                data-[state=closed]:fade-out-0
                                data-[state=closed]:zoom-out-95
                            "
                        >
                            {/* HEADER */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    px-3
                                    py-3
                                "
                            >
                                <div>
                                    <p
                                        className="
                                            text-sm
                                            font-semibold
                                            text-white
                                        "
                                    >
                                        Notifications
                                    </p>

                                    <p
                                        className="
                                            mt-0.5
                                            text-xs
                                            text-zinc-500
                                        "
                                    >
                                        Updates from Dykstra
                                    </p>
                                </div>

                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={
                                            handleMarkAllRead
                                        }
                                        className="
                                            text-xs
                                            font-medium
                                            text-violet-400
                                            transition-colors
                                            hover:text-violet-300
                                        "
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <DropdownMenuSeparator
                                className="
                                    mx-1
                                    bg-white/[0.09]
                                "
                            />

                            {/* LOADING */}

                            {notificationsLoading && (
                                <div
                                    className="
                                        px-4
                                        py-10
                                        text-center
                                        text-xs
                                        text-zinc-500
                                    "
                                >
                                    Loading notifications...
                                </div>
                            )}

                            {/* EMPTY */}

                            {!notificationsLoading &&
                                notifications.length ===
                                    0 && (
                                    <div
                                        className="
                                            flex
                                            flex-col
                                            items-center
                                            justify-center
                                            px-4
                                            py-10
                                            text-center
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-white/[0.04]
                                                text-zinc-500
                                            "
                                        >
                                            <Bell className="h-4 w-4" />
                                        </div>

                                        <p
                                            className="
                                                mt-3
                                                text-sm
                                                font-medium
                                                text-zinc-300
                                            "
                                        >
                                            You&apos;re all
                                            caught up
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                text-xs
                                                text-zinc-600
                                            "
                                        >
                                            No new
                                            notifications
                                        </p>
                                    </div>
                                )}

                            {/* NOTIFICATIONS */}

                            {!notificationsLoading &&
                                notifications.length > 0 && (
                                    <div
                                        className="
                                            max-h-[400px]
                                            overflow-y-auto
                                            pr-0.5
                                        "
                                    >
                                        {notifications.map(
                                            (
                                                notification
                                            ) => {
                                                const isUnread =
                                                    !notification.read_at;

                                                return (
                                                    <button
                                                        key={
                                                            notification.id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            handleNotificationClick(
                                                                notification
                                                            )
                                                        }
                                                        className={`
                                                            relative
                                                            w-full
                                                            rounded-xl
                                                            px-3
                                                            py-3
                                                            text-left
                                                            transition-colors
                                                            hover:bg-white/[0.045]
                                                            ${
                                                                isUnread
                                                                    ? "bg-violet-500/[0.035]"
                                                                    : ""
                                                            }
                                                        `}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div
                                                                className="
                                                                    flex
                                                                    h-9
                                                                    w-9
                                                                    shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-xl
                                                                    bg-violet-500/[0.10]
                                                                    text-violet-400
                                                                "
                                                            >
                                                                <Bell className="h-4 w-4" />
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <div
                                                                    className="
                                                                        flex
                                                                        items-start
                                                                        justify-between
                                                                        gap-2
                                                                    "
                                                                >
                                                                    <p
                                                                        className={`
                                                                            text-sm
                                                                            ${
                                                                                isUnread
                                                                                    ? "font-semibold text-white"
                                                                                    : "font-medium text-zinc-300"
                                                                            }
                                                                        `}
                                                                    >
                                                                        {
                                                                            notification.title
                                                                        }
                                                                    </p>

                                                                    {isUnread && (
                                                                        <span
                                                                            className="
                                                                                mt-1.5
                                                                                h-1.5
                                                                                w-1.5
                                                                                shrink-0
                                                                                rounded-full
                                                                                bg-violet-400
                                                                            "
                                                                        />
                                                                    )}
                                                                </div>

                                                                <p
                                                                    className="
                                                                        mt-1
                                                                        text-xs
                                                                        leading-5
                                                                        text-zinc-500
                                                                    "
                                                                >
                                                                    {
                                                                        notification.message
                                                                    }
                                                                </p>

                                                                <p
                                                                    className="
                                                                        mt-2
                                                                        text-[11px]
                                                                        text-zinc-600
                                                                    "
                                                                >
                                                                    {formatNotificationTime(
                                                                        notification.created_at
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* =================================================
                        SEPARATOR
                    ================================================= */}

                    <div
                        className="
                            mx-1
                            hidden
                            h-6
                            w-px
                            bg-white/[0.14]
                            sm:block
                        "
                    />

                    {/* =================================================
                        PROFILE
                    ================================================= */}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    px-1.5
                                    py-1
                                    outline-none
                                    transition-all
                                    hover:bg-white/[0.06]
                                    focus-visible:ring-2
                                    focus-visible:ring-white/[0.18]
                                "
                            >
                                <Avatar
                                    className="
                                        h-8
                                        w-8
                                        rounded-lg
                                        border
                                        border-white/[0.10]
                                    "
                                >
                                    <AvatarImage
                                        src={
                                            leetcodeAvatar ||
                                            undefined
                                        }
                                        alt={
                                            user?.name ||
                                            "User"
                                        }
                                    />

                                    <AvatarFallback
                                        className="
                                            rounded-lg
                                            bg-violet-500/[0.12]
                                            text-xs
                                            font-semibold
                                            text-violet-300
                                        "
                                    >
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>

                                <div
                                    className="
                                        hidden
                                        max-w-[140px]
                                        flex-col
                                        items-start
                                        sm:flex
                                    "
                                >
                                    <span
                                        className="
                                            max-w-full
                                            truncate
                                            text-xs
                                            font-medium
                                            text-zinc-200
                                        "
                                    >
                                        {user?.name || "User"}
                                    </span>

                                    <span
                                        className="
                                            max-w-full
                                            truncate
                                            text-[10px]
                                            text-zinc-500
                                        "
                                    >
                                        {user?.email || ""}
                                    </span>
                                </div>

                                <ChevronDown
                                    className="
                                        hidden
                                        h-3.5
                                        w-3.5
                                        text-zinc-500
                                        sm:block
                                    "
                                />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            sideOffset={8}
                            className="
                                w-64
                                rounded-2xl
                                border
                                border-white/[0.11]
                                bg-zinc-950/[0.97]
                                p-1.5
                                shadow-[0_24px_70px_rgba(0,0,0,0.60)]
                                backdrop-blur-2xl
                            "
                        >
                            {/* USER INFO */}

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    px-3
                                    py-3
                                "
                            >
                                <Avatar
                                    className="
                                        h-9
                                        w-9
                                        rounded-xl
                                        border
                                        border-white/[0.10]
                                    "
                                >
                                    <AvatarImage
                                        src={
                                            leetcodeAvatar ||
                                            undefined
                                        }
                                        alt={
                                            user?.name ||
                                            "User"
                                        }
                                    />

                                    <AvatarFallback
                                        className="
                                            rounded-xl
                                            bg-violet-500/[0.12]
                                            text-xs
                                            font-semibold
                                            text-violet-300
                                        "
                                    >
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0">
                                    <p
                                        className="
                                            truncate
                                            text-sm
                                            font-semibold
                                            text-white
                                        "
                                    >
                                        {user?.name || "User"}
                                    </p>

                                    <p
                                        className="
                                            truncate
                                            text-xs
                                            text-zinc-500
                                        "
                                    >
                                        {user?.email || ""}
                                    </p>
                                </div>
                            </div>

                            <DropdownMenuSeparator className="bg-white/[0.09]" />

                            {/* VIEW PROFILE */}

                            <DropdownMenuItem
                                onClick={() =>
                                    navigate({
                                        to: "/profile",
                                    })
                                }
                                className="
                                    cursor-pointer
                                    rounded-xl
                                    text-zinc-300
                                    focus:bg-white/[0.06]
                                    focus:text-white
                                "
                            >
                                <UserRound className="mr-2 h-4 w-4" />

                                View Profile
                            </DropdownMenuItem>

                            {/* =================================================
                                EMAIL NOTIFICATIONS
                            ================================================= */}

                            <div
                                className="
                                    my-0.5
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                    rounded-xl
                                    px-2.5
                                    py-2.5
                                "
                            >
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <Bell
                                        className="
                                            h-4
                                            w-4
                                            shrink-0
                                            text-zinc-400
                                        "
                                    />

                                    <div className="min-w-0">
                                        <p
                                            className="
                                                text-sm
                                                font-medium
                                                text-zinc-300
                                            "
                                        >
                                            Email notifications
                                        </p>

                                        <p
                                            className="
                                                mt-0.5
                                                text-[10px]
                                                text-zinc-600
                                            "
                                        >
                                            Revision reminders
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={
                                        emailNotificationsEnabled
                                    }
                                    aria-label="Toggle email notifications"
                                    disabled={
                                        emailNotificationsLoading
                                    }
                                    onClick={
                                        handleEmailNotificationsToggle
                                    }
                                    className={`
                                        relative
                                        h-5
                                        w-9
                                        shrink-0
                                        rounded-full
                                        outline-none
                                        transition-all
                                        duration-200
                                        focus-visible:ring-2
                                        focus-visible:ring-violet-500/50
                                        ${
                                            emailNotificationsEnabled
                                                ? "bg-violet-500"
                                                : "bg-white/[0.12]"
                                        }
                                        ${
                                            emailNotificationsLoading
                                                ? "cursor-wait opacity-50"
                                                : "cursor-pointer"
                                        }
                                    `}
                                >
                                    <span
                                        className={`
                                            absolute
                                            top-0.5
                                            h-4
                                            w-4
                                            rounded-full
                                            bg-white
                                            shadow-sm
                                            transition-transform
                                            duration-200
                                            ${
                                                emailNotificationsEnabled
                                                    ? "translate-x-4"
                                                    : "translate-x-0.5"
                                            }
                                        `}
                                    />
                                </button>
                            </div>

                            {/* COPY EMAIL */}

                            <DropdownMenuItem
                                onClick={copyEmail}
                                className="
                                    cursor-pointer
                                    rounded-xl
                                    text-zinc-300
                                    focus:bg-white/[0.06]
                                    focus:text-white
                                "
                            >
                                {copied ? (
                                    <Check className="mr-2 h-4 w-4" />
                                ) : (
                                    <Copy className="mr-2 h-4 w-4" />
                                )}

                                {copied
                                    ? "Copied"
                                    : "Copy email"}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-white/[0.09]" />

                            {/* LOGOUT */}

                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="
                                    cursor-pointer
                                    rounded-xl
                                    text-red-400
                                    focus:bg-red-500/[0.08]
                                    focus:text-red-300
                                "
                            >
                                <LogOut className="mr-2 h-4 w-4" />

                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* =========================================================
                SUBTLE BOTTOM LIGHT
            ========================================================= */}

            <div
                className="
                    pointer-events-none
                    absolute
                    bottom-0
                    left-0
                    h-px
                    w-full
                    bg-gradient-to-r
                    from-transparent
                    via-white/[0.12]
                    to-transparent
                "
            />
        </header>
    );
}