/* eslint-disable prettier/prettier */

import { useState } from "react";

import {
    Bell,
    Check,
    ChevronDown,
    Copy,
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

export function Topbar() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const navigate = useNavigate();

    const [copied, setCopied] = useState(false);
const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
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

    We intentionally don't use DiceBear or a static avatar.

    The profile image is taken from the LeetCode data already
    available on the authenticated user object.

    Multiple possible property shapes are supported so this
    component doesn't force a particular backend structure.
    ============================================================
    */

    const leetcodeProfile = (
        user as
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
            | null
    );

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
            await navigator.clipboard.writeText(user.email);

            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error("Failed to copy email:", error);
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
            {/* =====================================================
                TOPBAR INNER
            ===================================================== */}

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
        gap-2
    "
>
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

                {/* Unread indicator */}
                {hasUnreadNotifications && (
                    <span
                        className="
                            absolute
                            right-2
                            top-1.5

                            h-1.5
                            w-1.5

                            rounded-full

                            bg-violet-400

                            ring-2
                            ring-background
                        "
                    />
                )}
            </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="
                w-80

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
            {/* =================================================
                HEADER
            ================================================= */}

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

                {hasUnreadNotifications && (
                    <button
                        type="button"
                        onClick={() => setHasUnreadNotifications(false)}
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

            {/* =================================================
                NOTIFICATION ITEM
            ================================================= */}

            <div
                className="
                    relative

                    rounded-xl

                    px-3
                    py-3

                    transition-colors

                    hover:bg-white/[0.045]
                "
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
                        <div className="flex items-start justify-between gap-2">
                            <p
                                className="
                                    text-sm
                                    font-medium
                                    text-zinc-200
                                "
                            >
                                Welcome to Dykstra
                            </p>

                            {hasUnreadNotifications && (
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
                            Stay consistent with your interview
                            preparation and revision schedule.
                        </p>

                        <p
                            className="
                                mt-2

                                text-[11px]

                                text-zinc-600
                            "
                        >
                            Just now
                        </p>
                    </div>
                </div>
            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {!hasUnreadNotifications && (
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
                        You&apos;re all caught up
                    </p>

                    <p
                        className="
                            mt-1

                            text-xs

                            text-zinc-600
                        "
                    >
                        No new notifications
                    </p>
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

    {/* KEEP YOUR EXISTING PROFILE DROPDOWN HERE */}
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