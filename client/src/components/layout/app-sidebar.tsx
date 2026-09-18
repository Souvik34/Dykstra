/* eslint-disable prettier/prettier */

import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Code2,
  CalendarClock,
  Trophy,
  History,
   Waypoints,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Problems",
    url: "/problems",
    icon: Code2,
  },
    {
    title: "DSA Visualizer",
    url: "/visualizer",
    icon: Waypoints,
  },
  {
    title: "Interviews",
    url: "/interviews",
    icon: CalendarClock,
  },
  {
    title: "Contests",
    url: "/contests",
    icon: Trophy,
    comingSoon: true,
  },
];

const progressItems = [
  {
    title: "Interview History",
    url: "/interview-history",
    icon: History,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const path = useRouterState({
    select: (r) => r.location.pathname,
  });

  const isActive = (url: string) => path === url;

  return (
    <Sidebar
      collapsible="icon"
      className="
        border-r
        border-white/[0.08]
        bg-black/95
        shadow-[8px_0_40px_-25px_rgba(255,255,255,0.12)]
      "
    >
      {/* ================= HEADER ================= */}

      <SidebarHeader
        className="
          border-b
          border-white/[0.06]
          px-3
          py-4
        "
      >
        <Link
          to="/dashboard"
          className="
            group
            flex
            items-center
            gap-2
          "
        >
          <div
            className="
              grid
              h-9
              w-9
              shrink-0
              place-items-center
              rounded-xl
              text-primary-foreground
              transition-all
              duration-300
              group-hover:scale-105
              group-hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.8)]
            "
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-elegant)",
            }}
          >
            <Code2 className="h-5 w-5" />
          </div>

          {!collapsed && (
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight">
                Dykstra
              </div>

              <div className="mt-0.5 text-xs font-medium text-slate-400">
                DSA Prep Suite
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* ================= CONTENT ================= */}

      <SidebarContent className="px-1">

        {/* ================= PRACTICE ================= */}

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold tracking-wide text-slate-400">
            Practice
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const active = isActive(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={collapsed ? item.title : undefined}
                      className="
                        group
                        relative
                        h-10
                        rounded-lg
                        transition-all
                        duration-300
                        ease-out
                        hover:bg-white/[0.055]
                        hover:text-white
                        data-[active=true]:bg-blue-500/[0.10]
                        data-[active=true]:text-blue-300
                        data-[active=true]:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_20px_-10px_rgba(59,130,246,0.6)]
                      "
                    >
                      <Link
                        to={item.url}
                        className="relative flex w-full items-center gap-3"
                      >
                        {/* Active indicator */}

                        {active && (
                          <span
                            className="
                              absolute
                              -left-1
                              h-5
                              w-[2px]
                              rounded-full
                              bg-blue-400
                              shadow-[0_0_12px_rgba(96,165,250,0.9)]
                            "
                          />
                        )}

                        <item.icon
                          className="
                            h-[17px]
                            w-[17px]
                            shrink-0
                            transition-transform
                            duration-300
                            group-hover:scale-110
                          "
                        />

                        {!collapsed && (
                          <span className="flex min-w-0 flex-1 items-center justify-between">
                            <span className="text-sm font-medium">
                              {item.title}
                            </span>

                            {item.comingSoon && (
                              <span
                                className="
                                  ml-2
                                  rounded-full
                                  border
                                  border-blue-400/20
                                  bg-blue-400/[0.08]
                                  px-2
                                  py-0.5
                                  text-[10px]
                                  font-semibold
                                  tracking-wide
                                  text-blue-300
                                "
                              >
                                SOON
                              </span>
                            )}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ================= PROGRESS ================= */}

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold tracking-wide text-slate-400">
            Progress
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {progressItems.map((item) => {
                const active = isActive(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={collapsed ? item.title : undefined}
                      className="
                        group
                        relative
                        h-10
                        rounded-lg
                        transition-all
                        duration-300
                        hover:bg-white/[0.055]
                        hover:text-white
                        data-[active=true]:bg-blue-500/[0.10]
                        data-[active=true]:text-blue-300
                        data-[active=true]:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_20px_-10px_rgba(59,130,246,0.6)]
                      "
                    >
                      <Link
                        to={item.url}
                        className="relative flex w-full items-center gap-3"
                      >
                        {active && (
                          <span
                            className="
                              absolute
                              -left-1
                              h-5
                              w-[2px]
                              rounded-full
                              bg-blue-400
                              shadow-[0_0_12px_rgba(96,165,250,0.9)]
                            "
                          />
                        )}

                        <item.icon
                          className="
                            h-[17px]
                            w-[17px]
                            shrink-0
                            transition-transform
                            duration-300
                            group-hover:scale-110
                          "
                        />

                        {!collapsed && (
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ================= FOOTER ================= */}

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div
            className="
              relative
              overflow-hidden
              rounded-xl
              border
              border-white/[0.08]
              bg-white/[0.025]
              p-3
            "
          >
            {/* subtle glow */}

            <div
              className="
                pointer-events-none
                absolute
                -right-8
                -top-8
                h-20
                w-20
                rounded-full
                bg-blue-500/10
                blur-2xl
              "
            />

            <div className="relative">
              <div className="mb-1 text-xs font-semibold text-slate-200">
                Keep building.
              </div>

              <div className="text-xs font-medium leading-relaxed text-slate-400">
                Consistency beats intensity.
              </div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}