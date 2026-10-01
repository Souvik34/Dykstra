/* eslint-disable prettier/prettier */

import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Code2,
  Filter,
  History,
  Trophy,
  X,
} from "lucide-react";

import {
  createFileRoute,
  Outlet,
  useMatchRoute,
  useNavigate,
} from "@tanstack/react-router";

import { toast } from "sonner";

import interviewService from "../services/interviewService";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ScreenLoader } from "@/components/ui/ScreenLoader";

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

type InterviewFilters = {
  type: string;
  company: string;
  difficulty: string;
  language: string;
  role: string;
  report: "ALL" | "AVAILABLE" | "UNAVAILABLE";
};

const EMPTY_FILTERS: InterviewFilters = {
  type: "ALL",
  company: "ALL",
  difficulty: "ALL",
  language: "ALL",
  role: "ALL",
  report: "ALL",
};

const ITEMS_PER_PAGE = 10;

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatFilterValue = (value: string) => {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getInterviewDate = (
  interview: InterviewHistoryItem
) => {
  return new Date(
    interview.endedAt || interview.createdAt
  ).getTime();
};

function InterviewHistoryPage() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  const [interviews, setInterviews] = useState<
    InterviewHistoryItem[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] =
    useState<InterviewFilters>(EMPTY_FILTERS);

  const isDetailPage = !!matchRoute({
    to: "/interview-history/$interviewId",
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);

        const response =
          await interviewService.getInterviewHistory();

        setInterviews(response.data?.data || []);
      } catch (error) {
        console.error(
          "Failed to fetch interview history:",
          error
        );

        toast.error(
          "Failed to load interview history"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  /**
   * Always keep interviews ordered:
   *
   * Latest
   *   ↓
   * Older
   *   ↓
   * Oldest
   *
   * This happens before filtering and pagination.
   */
  const sortedInterviews = useMemo(() => {
    return [...interviews].sort((a, b) => {
      return (
        getInterviewDate(b) -
        getInterviewDate(a)
      );
    });
  }, [interviews]);

  /**
   * Generate filter options from the actual
   * interview history.
   */
  const filterOptions = useMemo(() => {
    const getUniqueValues = (
      values: (string | null | undefined)[]
    ) => {
      return [
        ...new Set(
          values.filter(
            (value): value is string =>
              Boolean(value)
          )
        ),
      ].sort((a, b) =>
        a.localeCompare(b)
      );
    };

    return {
      types: getUniqueValues(
        sortedInterviews.map(
          (interview) => interview.type
        )
      ),

      companies: getUniqueValues(
        sortedInterviews.map(
          (interview) => interview.company
        )
      ),

      difficulties: getUniqueValues(
        sortedInterviews.map(
          (interview) => interview.difficulty
        )
      ),

      languages: getUniqueValues(
        sortedInterviews.map(
          (interview) => interview.language
        )
      ),

      roles: getUniqueValues(
        sortedInterviews.map(
          (interview) =>
            interview.role || "SDE-1"
        )
      ),
    };
  }, [sortedInterviews]);

  /**
   * Apply filters AFTER sorting.
   *
   * So the result remains:
   *
   * latest matching interview
   *       ↓
   * older matching interview
   *       ↓
   * oldest matching interview
   */
  const filteredInterviews = useMemo(() => {
    return sortedInterviews.filter(
      (interview) => {
        const matchesType =
          filters.type === "ALL" ||
          interview.type === filters.type;

        const matchesCompany =
          filters.company === "ALL" ||
          interview.company ===
            filters.company;

        const matchesDifficulty =
          filters.difficulty === "ALL" ||
          interview.difficulty ===
            filters.difficulty;

        const matchesLanguage =
          filters.language === "ALL" ||
          interview.language ===
            filters.language;

        const matchesRole =
          filters.role === "ALL" ||
          (interview.role || "SDE-1") ===
            filters.role;

        const matchesReport =
          filters.report === "ALL" ||
          (filters.report === "AVAILABLE"
            ? Boolean(interview.report)
            : !interview.report);

        return (
          matchesType &&
          matchesCompany &&
          matchesDifficulty &&
          matchesLanguage &&
          matchesRole &&
          matchesReport
        );
      }
    );
  }, [sortedInterviews, filters]);

  /**
   * Reset to page 1 whenever filters change.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  /**
   * Pagination happens AFTER filtering.
   */
  const totalPages = Math.ceil(
    filteredInterviews.length /
      ITEMS_PER_PAGE
  );

  const paginatedInterviews = useMemo(() => {
    const startIndex =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return filteredInterviews.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [
    filteredInterviews,
    currentPage,
  ]);

  const activeFilterCount =
    Object.values(filters).filter(
      (value) => value !== "ALL"
    ).length;

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
  };

  const updateFilter = (
    key: keyof InterviewFilters,
    value: string
  ) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const goToInterview = (
    interviewId: string
  ) => {
    navigate({
      to: "/interview-history/$interviewId",
      params: {
        interviewId,
      },
    });
  };

  if (loading) {
    return <ScreenLoader />;
  }

  /**
   * Detail page is rendered through Outlet.
   */
  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ------------------------------------------------ */}
        {/* TOP BAR */}
        {/* ------------------------------------------------ */}

        <div className="mb-10 flex items-center justify-between">

          <Button
            variant="ghost"
            onClick={() =>
              navigate({
                to: "/dashboard",
              })
            }
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>

          <div className="flex items-center gap-2">

            {/* FILTER BUTTON */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.07] hover:text-white"
                >
                  <Filter className="h-4 w-4" />

                  Filter

                  {activeFilterCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500/20 px-1.5 text-[10px] font-semibold text-violet-400">
                      {activeFilterCount}
                    </span>
                  )}

                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="max-h-[75vh] w-72 overflow-y-auto border-white/10 bg-[#111118] text-white"
              >

                {/* FILTER HEADER */}

                <div className="flex items-center justify-between px-2 py-1.5">

                  <DropdownMenuLabel className="p-0 text-white">
                    Filter interviews
                  </DropdownMenuLabel>

                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-white"
                    >
                      <X className="h-3 w-3" />
                      Clear
                    </button>
                  )}

                </div>

                <DropdownMenuSeparator />

                {/* TYPE */}

                <DropdownMenuLabel>
                  Interview Type
                </DropdownMenuLabel>

                <DropdownMenuCheckboxItem
                  checked={
                    filters.type === "ALL"
                  }
                  onCheckedChange={() =>
                    updateFilter(
                      "type",
                      "ALL"
                    )
                  }
                >
                  All types
                </DropdownMenuCheckboxItem>

                {filterOptions.types.map(
                  (type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={
                        filters.type ===
                        type
                      }
                      onCheckedChange={() =>
                        updateFilter(
                          "type",
                          type
                        )
                      }
                    >
                      {formatFilterValue(
                        type
                      )}
                    </DropdownMenuCheckboxItem>
                  )
                )}

                <DropdownMenuSeparator />

                {/* COMPANY */}

                <DropdownMenuLabel>
                  Company
                </DropdownMenuLabel>

                <DropdownMenuCheckboxItem
                  checked={
                    filters.company ===
                    "ALL"
                  }
                  onCheckedChange={() =>
                    updateFilter(
                      "company",
                      "ALL"
                    )
                  }
                >
                  All companies
                </DropdownMenuCheckboxItem>

                {filterOptions.companies.map(
                  (company) => (
                    <DropdownMenuCheckboxItem
                      key={company}
                      checked={
                        filters.company ===
                        company
                      }
                      onCheckedChange={() =>
                        updateFilter(
                          "company",
                          company
                        )
                      }
                    >
                      {company}
                    </DropdownMenuCheckboxItem>
                  )
                )}

                <DropdownMenuSeparator />

                {/* DIFFICULTY */}

                <DropdownMenuLabel>
                  Difficulty
                </DropdownMenuLabel>

                <DropdownMenuCheckboxItem
                  checked={
                    filters.difficulty ===
                    "ALL"
                  }
                  onCheckedChange={() =>
                    updateFilter(
                      "difficulty",
                      "ALL"
                    )
                  }
                >
                  All difficulties
                </DropdownMenuCheckboxItem>

                {filterOptions.difficulties.map(
                  (difficulty) => (
                    <DropdownMenuCheckboxItem
                      key={difficulty}
                      checked={
                        filters.difficulty ===
                        difficulty
                      }
                      onCheckedChange={() =>
                        updateFilter(
                          "difficulty",
                          difficulty
                        )
                      }
                    >
                      {formatFilterValue(
                        difficulty
                      )}
                    </DropdownMenuCheckboxItem>
                  )
                )}

                <DropdownMenuSeparator />

                {/* LANGUAGE */}

                <DropdownMenuLabel>
                  Language
                </DropdownMenuLabel>

                <DropdownMenuCheckboxItem
                  checked={
                    filters.language ===
                    "ALL"
                  }
                  onCheckedChange={() =>
                    updateFilter(
                      "language",
                      "ALL"
                    )
                  }
                >
                  All languages
                </DropdownMenuCheckboxItem>

                {filterOptions.languages.map(
                  (language) => (
                    <DropdownMenuCheckboxItem
                      key={language}
                      checked={
                        filters.language ===
                        language
                      }
                      onCheckedChange={() =>
                        updateFilter(
                          "language",
                          language
                        )
                      }
                    >
                      {formatFilterValue(
                        language
                      )}
                    </DropdownMenuCheckboxItem>
                  )
                )}

                <DropdownMenuSeparator />

                {/* ROLE */}

                <DropdownMenuLabel>
                  Role
                </DropdownMenuLabel>

                <DropdownMenuCheckboxItem
                  checked={
                    filters.role === "ALL"
                  }
                  onCheckedChange={() =>
                    updateFilter(
                      "role",
                      "ALL"
                    )
                  }
                >
                  All roles
                </DropdownMenuCheckboxItem>

                {filterOptions.roles.map(
                  (role) => (
                    <DropdownMenuCheckboxItem
                      key={role}
                      checked={
                        filters.role === role
                      }
                      onCheckedChange={() =>
                        updateFilter(
                          "role",
                          role
                        )
                      }
                    >
                      {role}
                    </DropdownMenuCheckboxItem>
                  )
                )}

                <DropdownMenuSeparator />

                {/* REPORT */}

                <DropdownMenuLabel>
                  Report
                </DropdownMenuLabel>

                <DropdownMenuCheckboxItem
                  checked={
                    filters.report ===
                    "ALL"
                  }
                  onCheckedChange={() =>
                    updateFilter(
                      "report",
                      "ALL"
                    )
                  }
                >
                  All interviews
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  checked={
                    filters.report ===
                    "AVAILABLE"
                  }
                  onCheckedChange={() =>
                    updateFilter(
                      "report",
                      "AVAILABLE"
                    )
                  }
                >
                  Report available
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  checked={
                    filters.report ===
                    "UNAVAILABLE"
                  }
                  onCheckedChange={() =>
                    updateFilter(
                      "report",
                      "UNAVAILABLE"
                    )
                  }
                >
                  Report unavailable
                </DropdownMenuCheckboxItem>

              </DropdownMenuContent>
            </DropdownMenu>

            {/* HISTORY BADGE */}

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground">
              <History className="h-3.5 w-3.5 text-violet-400" />
              Interview History
            </div>

          </div>
        </div>

        {/* ------------------------------------------------ */}
        {/* HEADER */}
        {/* ------------------------------------------------ */}

        <div className="mb-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Interview History
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Review your previous AI
                interview sessions and
                performance.
              </p>
            </div>

            {interviews.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {filteredInterviews.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {interviews.length}
                </span>{" "}
                interviews
              </div>
            )}

          </div>
        </div>

        {/* ------------------------------------------------ */}
        {/* EMPTY STATE - NO INTERVIEWS */}
        {/* ------------------------------------------------ */}

        {interviews.length === 0 && (
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">

              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <History className="h-7 w-7 text-muted-foreground" />
              </div>

              <h2 className="text-lg font-semibold">
                No interviews yet
              </h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Your completed AI interview
                sessions will appear here.
              </p>

              <Button
                className="mt-6"
                onClick={() =>
                  navigate({
                    to: "/interview",
                  })
                }
              >
                Start an Interview
              </Button>

            </CardContent>
          </Card>
        )}

        {/* ------------------------------------------------ */}
        {/* EMPTY STATE - FILTERED */}
        {/* ------------------------------------------------ */}

        {interviews.length > 0 &&
          filteredInterviews.length === 0 && (
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">

                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Filter className="h-7 w-7 text-muted-foreground" />
                </div>

                <h2 className="text-lg font-semibold">
                  No matching interviews
                </h2>

                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  No interview matches the
                  selected filters.
                </p>

                <Button
                  variant="outline"
                  className="mt-6 gap-2"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>

              </CardContent>
            </Card>
          )}

        {/* ------------------------------------------------ */}
        {/* INTERVIEW CARDS */}
        {/* ------------------------------------------------ */}

        {paginatedInterviews.length > 0 && (
          <div className="space-y-4">

            {paginatedInterviews.map(
              (interview) => (
                <Card
                  key={interview.id}
                  className="group cursor-pointer border-white/10 bg-white/[0.02] transition-all duration-200 hover:border-violet-500/30 hover:bg-white/[0.035]"
                  onClick={() =>
                    goToInterview(
                      interview.id
                    )
                  }
                >
                  <CardContent className="p-5 sm:p-6">

                    {/* TOP ROW */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                            <Brain className="h-5 w-5 text-violet-400" />
                          </div>

                          <div className="min-w-0">

                            <h2 className="truncate text-base font-semibold text-foreground transition-colors group-hover:text-violet-300">
                              {interview.title ||
                                interview.question
                                  ?.title ||
                                "Interview"}
                            </h2>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">

                              {interview.company && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3.5 w-3.5" />
                                  {interview.company}
                                </span>
                              )}

                              <span>
                                {interview.role ||
                                  "SDE-1"}
                              </span>

                            </div>

                          </div>
                        </div>

                      </div>

                      {/* SCORE */}

                      {interview.report && (
                        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">

                          <Trophy className="h-4 w-4 text-emerald-400" />

                          <div>
                            <div className="text-xs text-muted-foreground">
                              Score
                            </div>

                            <div className="text-sm font-semibold text-emerald-400">
                              {interview.report.overallScore}
                              /10
                            </div>
                          </div>

                        </div>
                      )}

                    </div>

                    {/* METADATA */}

                    <div className="mt-5 flex flex-wrap items-center gap-2">

                      {/* TYPE */}

                      <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-muted-foreground">
                        <Code2 className="h-3.5 w-3.5" />
                        {formatFilterValue(
                          interview.type
                        )}
                      </div>

                      {/* LANGUAGE */}

                      <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-muted-foreground">
                        {formatFilterValue(
                          interview.language
                        )}
                      </div>

                      {/* DIFFICULTY */}

                      <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-muted-foreground">
                        {formatFilterValue(
                          interview.difficulty
                        )}
                      </div>

                      {/* DATE */}

                      <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />

                        {formatDate(
                          interview.endedAt ||
                            interview.createdAt
                        )}
                      </div>

                      {/* REPORT STATUS */}

                      {interview.report ? (
                        <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Report available
                        </div>
                      ) : (
                        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-muted-foreground">
                          Report unavailable
                        </div>
                      )}

                    </div>

                    {/* VIEW */}

                    <div className="mt-5 flex items-center justify-end">

                      <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-violet-400">
                        View interview
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>

                    </div>

                  </CardContent>
                </Card>
              )
            )}

          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* PAGINATION */}
        {/* ------------------------------------------------ */}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">

            {/* PREVIOUS */}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(
                  (page) => page - 1
                )
              }
              className="gap-1.5 border-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            {/* PAGE NUMBERS */}

            <div className="flex items-center gap-1">

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <Button
                  key={page}
                  variant={
                    currentPage === page
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  className={
                    currentPage === page
                      ? "min-w-9"
                      : "min-w-9 text-muted-foreground"
                  }
                >
                  {page}
                </Button>
              ))}

            </div>

            {/* NEXT */}

            <Button
              variant="outline"
              size="sm"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) => page + 1
                )
              }
              className="gap-1.5 border-white/10"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

          </div>
        )}

      </div>
    </div>
  );
}

export const Route = createFileRoute(
  "/interview-history"
)({
  component: InterviewHistoryPage,
});