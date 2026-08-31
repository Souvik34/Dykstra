/* eslint-disable prettier/prettier */

import { useEffect, useState, useMemo } from "react";
import {
  createFileRoute,
  Outlet,
  useMatchRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CalendarDays,
  CheckCircle2,
  Code2,
  History,
  Building2,
  Trophy,
} from "lucide-react";

import { toast } from "sonner";

import interviewService from "../services/interviewService";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ScreenLoader } from "@/components/ui/ScreenLoader";

export const Route = createFileRoute("/interview-history")({
  component: InterviewHistoryPage,
});

interface InterviewReport {
  overallScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  optimizationScore: number;
  strengths: string;
  weaknesses: string;
  finalFeedback: string;
  createdAt: string;
}

interface InterviewQuestion {
  title?: string;
  description?: string;
  problem?: string;
  examples?: unknown;
  constraints?: string[];
  starterCode?: string | Record<string, string>;
}

interface InterviewHistoryItem {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  language: string;
  company?: string | null;
  role?: string | null;
  questionStrategy?: string;
  createdAt: string;
  endedAt?: string | null;
  question: InterviewQuestion;
  code: string;
  report: InterviewReport | null;
}

function formatDate(date?: string | null) {
  if (!date) {
    return "Unknown date";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function InterviewHistoryPage() {
  const navigate = useNavigate();

  /**
   * IMPORTANT:
   *
   * This hook MUST always execute.
   *
   * Do not put the conditional return before useEffect.
   */
  const matchRoute = useMatchRoute();

  const isDetailPage = matchRoute({
    to: "/interview-history/$sessionId",
    fuzzy: true,
  });

  const [interviews, setInterviews] = useState<
    InterviewHistoryItem[]
  >([]);

  const [loading, setLoading] = useState(true);
const [currentPage, setCurrentPage] = useState(1);

const ITEMS_PER_PAGE = 10;
  /**
   * Load history.
   *
   * This effect always executes, regardless of whether
   * the child detail route is active.
   */
  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        console.log("📚 Loading interview history...");

        const res =
          await interviewService.getInterviewHistory();

        console.log(
          " History response:",
          res.data
        );

        if (!mounted) {
          return;
        }

        setInterviews(
          res.data?.data || []
        );
      } catch (error) {
        console.error(
          "Failed to load interview history:",
          error
        );

        if (mounted) {
          toast.error(
            "Unable to load interview history."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * VERY IMPORTANT
   *
   * When URL is:
   *
   * /interview-history
   *
   * render this page.
   *
   * When URL is:
   *
   * /interview-history/:sessionId
   *
   * render the child route through Outlet.
   */

  const totalPages = Math.ceil(
  interviews.length / ITEMS_PER_PAGE
);

const paginatedInterviews = useMemo(() => {
  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE;

  return interviews.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
}, [interviews, currentPage]);
  if (isDetailPage) {
    console.log(
      " DETAIL ROUTE ACTIVE → RENDERING OUTLET"
    );

    return <Outlet />;
  }

  if (loading) {
    return (
      <ScreenLoader text="Loading interviews" />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050608] text-white">

      {/* Background blobs */}

      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[140px]" />

      <div className="pointer-events-none absolute right-[-180px] top-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[150px]" />

      <div className="pointer-events-none absolute bottom-[-200px] left-[35%] h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-[140px]" />

      {/* Grid */}

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-5 py-8 md:px-8">

        {/* Top bar */}

        <div className="mb-10 flex items-center justify-between">

          <Button
            variant="ghost"
            onClick={() =>
              navigate({
                to: "/dashboard",
              })
            }
            className="gap-2 text-muted-foreground hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            Dashboard
          </Button>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground">

            <History className="h-3.5 w-3.5 text-violet-400" />

            Interview History

          </div>
        </div>

        {/* Header */}

        <div className="mb-10">

          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">

            <History className="h-6 w-6 text-violet-400" />

          </div>

          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Interview History
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            Review your previous AI interviews, solutions, and feedback.
            Everything here is read-only.
          </p>

        </div>

        {/* Empty state */}

        {interviews.length === 0 ? (

          <Card className="border-white/10 bg-white/[0.035] shadow-2xl shadow-black/30 backdrop-blur-xl">

            <CardContent className="flex flex-col items-center justify-center px-6 py-20 text-center">

              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">

                <Brain className="h-7 w-7 text-violet-400" />

              </div>

              <h2 className="text-xl font-semibold">
                No completed interviews yet
              </h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Complete your first AI mock interview and your question,
                solution, and report will appear here.
              </p>

              <Button
                className="mt-6 bg-gradient-to-r from-violet-600 to-blue-600"
                onClick={() =>
                  navigate({
                    to: "/interviews",
                  })
                }
              >
                Start an Interview

                <ArrowRight className="ml-2 h-4 w-4" />

              </Button>

            </CardContent>

          </Card>

        ) : (

          <div className="space-y-4">

           {paginatedInterviews.map((interview) => (

              <Card
                key={interview.id}
                className="group cursor-pointer border-white/10 bg-white/[0.035] shadow-xl shadow-black/20 backdrop-blur-xl transition-all duration-200 hover:-translate-y-[1px] hover:border-violet-400/25 hover:bg-white/[0.05]"
                onClick={() => {

                  console.log(
                    "🔥 INTERVIEW CLICKED:",
                    interview.id
                  );

                  console.log(
                    "🔥 NAVIGATING TO DETAIL:",
                    `/interview-history/${interview.id}`
                  );

                  navigate({
                    to: "/interview-history/$sessionId",
                    params: {
                      sessionId: interview.id,
                    },
                  });
                }}
              >

                <CardContent className="p-5 md:p-6">

                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    {/* Left */}

                    <div className="min-w-0">

                      <div className="mb-2 flex items-center gap-2">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">

                          <Code2 className="h-4 w-4 text-violet-400" />

                        </div>

                        <h2 className="truncate text-base font-semibold md:text-lg">

                          {interview.title ||
                            "Untitled Interview"}

                        </h2>

                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">

                        {interview.company && (

                          <span className="flex items-center gap-1.5">

                            <Building2 className="h-3.5 w-3.5" />

                            {interview.company}

                          </span>

                        )}

                        <span>
                          {interview.role ||
                            "SDE-1"}
                        </span>

                        <span>
                          {interview.language}
                        </span>

                        <span>
                          {interview.difficulty}
                        </span>

                        <span className="flex items-center gap-1.5">

                          <CalendarDays className="h-3.5 w-3.5" />

                          {formatDate(
                            interview.endedAt ||
                            interview.createdAt
                          )}

                        </span>

                      </div>

                    </div>

                    {/* Right */}

                    <div className="flex items-center justify-between gap-5 md:justify-end">

                      {interview.report ? (

                        <div className="flex items-center gap-2">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-500/10">

                            <Trophy className="h-4 w-4 text-emerald-400" />

                          </div>

                          <div>

                            <p className="text-[11px] text-muted-foreground">
                              Overall
                            </p>

                            <p className="text-sm font-semibold">
                              {interview.report.overallScore}
                              /100
                            </p>

                          </div>

                        </div>

                      ) : (

                        <div className="text-xs text-muted-foreground">
                          Report unavailable
                        </div>

                      )}

                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-violet-400" />

                    </div>

                  </div>

                </CardContent>

              </Card>

            ))}

          </div>

        )}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => page - 1)
              }
              className="gap-1 text-muted-foreground hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <Button
                  key={page}
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page
                      ? "bg-violet-500/15 text-violet-400 hover:bg-violet-500/20 hover:text-violet-300"
                      : "text-muted-foreground hover:bg-white/[0.05] hover:text-white"
                  }
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => page + 1)
              }
              className="gap-1 text-muted-foreground hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        {/* Bottom info */}

        {interviews.length > 0 && (

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">

            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />

            Your interview history is read-only

          </div>

        )}

      </div>

    </div>
  );
}