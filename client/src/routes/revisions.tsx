/* eslint-disable prettier/prettier */

import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  ArrowUpRight,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  ExternalLink,
  Flame,
  Gauge,
  History,
  Layers3,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";

import { requireAuth } from "@/lib/route-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

import revisionService from "@/services/revisionService";
import type { RevisionItem } from "@/services/revisionService";

import { clearRevisionCache } from "@/lib/revision-state";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/revisions")({
  beforeLoad: ({ location }) => requireAuth(location),
  component: RevisionsPage,
});

const ITEMS_PER_PAGE = 10;

function RevisionsPage() {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [allRevisions, setAllRevisions] = useState<RevisionItem[]>([]);

  const [completingId, setCompletingId] =
    useState<number | null>(null);

  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  const loadRevisions = async () => {
    try {
      setLoading(true);

      const [dueRes, allRes] = await Promise.all([
        revisionService.getDueRevisions(),
        revisionService.getAllRevisions(),
      ]);

      setRevisions(dueRes?.revisions ?? []);
      setAllRevisions(allRes?.revisions ?? []);
    } catch (err) {
      console.error("Failed to load revisions:", err);

      setRevisions([]);
      setAllRevisions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevisions();
  }, []);

  const handleComplete = async (
    problemId: number,
    timeTaken: number = 0
  ) => {
    try {
      setCompletingId(problemId);

      await revisionService.completeRevision(
        problemId,
        timeTaken
      );

      clearRevisionCache();

      setRevisions((prev) =>
        prev.filter(
          (r) => r.problem_id !== problemId
        )
      );

      const res =
        await revisionService.getDueRevisions();

      const allRes =
        await revisionService.getAllRevisions();

      setAllRevisions(allRes?.revisions ?? []);

      if (!res.blocked) {
        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 500);

        return;
      }

      setRevisions(res.revisions ?? []);
    } catch (err) {
      console.error(
        "Failed to complete revision:",
        err
      );
    } finally {
      setCompletingId(null);
    }
  };

  const stats = useMemo(() => {
    const totalDue = revisions.length;

    const high = revisions.filter(
      (r) => r.priorityLabel === "HIGH"
    ).length;

    const medium = revisions.filter(
      (r) => r.priorityLabel === "MEDIUM"
    ).length;

    const averageConfidence =
      totalDue > 0
        ? Math.round(
            revisions.reduce(
              (sum, r) =>
                sum +
                (Number(r.confidence_rating) || 0),
              0
            ) / totalDue
          )
        : 0;

    const active = allRevisions.filter(
      (r) => !r.is_completed
    );

    const completed = allRevisions.filter(
      (r) => r.is_completed
    );

    return {
      totalDue,
      high,
      medium,
      averageConfidence,
      activeCount: active.length,
      completedCount: completed.length,
      totalTracked: allRevisions.length,
    };
  }, [revisions, allRevisions]);

  const visibleProgress = useMemo(() => {
    let result = [...allRevisions];

    if (filter === "ACTIVE") {
      result = result.filter(
        (revision) => !revision.is_completed
      );
    }

    if (filter === "COMPLETED") {
      result = result.filter(
        (revision) => revision.is_completed
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((revision) =>
        [
          revision.title,
          revision.topic,
          revision.felt_difficulty,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query)
          )
      );
    }

    return result;
  }, [allRevisions, filter, search]);

  const totalPages = Math.ceil(
    visibleProgress.length / ITEMS_PER_PAGE
  );

  const paginatedProgress = useMemo(() => {
    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return visibleProgress.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [visibleProgress, currentPage]);

  // Reset pagination whenever search/filter changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  // Prevent being stuck on an empty page after
  // completing/removing revisions.
  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(
        visibleProgress.length / ITEMS_PER_PAGE
      )
    );

    setCurrentPage((page) =>
      Math.min(page, pages)
    );
  }, [visibleProgress.length]);

  const progressPreview = useMemo(() => {
    return allRevisions
      .filter((revision) => !revision.is_completed)
      .sort((a, b) => {
        const aDate = new Date(
          a.next_revision_date
        ).getTime();

        const bDate = new Date(
          b.next_revision_date
        ).getTime();

        return aDate - bDate;
      })
      .slice(0, 5);
  }, [allRevisions]);

  if (loading) {
    return (
      <DashboardShell>
        <RevisionSkeleton />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="relative min-h-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/[0.06] blur-3xl" />

          <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-violet-500/[0.05] blur-3xl" />

          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-500/[0.04] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl space-y-8 px-1 pb-10">

          {/* HERO */}
          <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-8">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />

            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/[0.09] blur-3xl" />

            <div className="relative">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.07] px-3 py-1.5 text-xs font-medium text-blue-300">
                    <Brain className="h-3.5 w-3.5" />

                    SPACED REVISION

                    <Sparkles className="h-3 w-3 animate-pulse" />
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                    Keep your knowledge{" "}
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                      sharp.
                    </span>
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 md:text-base">
                    Revisit problems at the right time,
                    strengthen the patterns you've learned,
                    and keep them interview-ready.
                  </p>
                </div>

                <div className="hidden md:flex">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035]">
                    <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl" />

                    <Brain className="relative h-9 w-9 animate-[pulse_3s_ease-in-out_infinite] text-blue-300" />
                  </div>
                </div>
              </div>

              {/* STATS */}
              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard
                  icon={<Clock3 />}
                  label="Due today"
                  value={stats.totalDue}
                  accent="blue"
                />

                <StatCard
                  icon={<Flame />}
                  label="High priority"
                  value={stats.high}
                  accent="red"
                />

                <StatCard
                  icon={<Target />}
                  label="Medium priority"
                  value={stats.medium}
                  accent="amber"
                />

                <StatCard
                  icon={<Gauge />}
                  label="Avg confidence"
                  value={`${stats.averageConfidence}%`}
                  accent="violet"
                />
              </div>

              {/* TODAY QUEUE PROGRESS */}
              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-blue-300" />

                    <span className="text-sm font-medium text-zinc-200">
                      Today's revision queue
                    </span>
                  </div>

                  <span className="text-xs text-zinc-500">
                    {stats.totalDue === 0
                      ? "All clear"
                      : `${stats.totalDue} remaining`}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 transition-all duration-700"
                    style={{
                      width:
                        stats.totalDue === 0
                          ? "100%"
                          : "8%",
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* TODAY'S REVISIONS */}
          {revisions.length > 0 && (
            <div className="flex flex-col justify-between gap-3 px-1 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-2">
                  <Layers3 className="h-5 w-5 text-blue-400" />

                  <h2 className="text-xl font-semibold tracking-tight text-white">
                    Today's revisions
                  </h2>
                </div>

                <p className="mt-1 text-sm text-zinc-500">
                  Start with the highest-priority problems.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <RefreshCw className="h-3.5 w-3.5" />

                Spaced repetition active
              </div>
            </div>
          )}

          {revisions.length > 0 ? (
            <div className="space-y-4">
              {revisions.map((rev, index) => (
                <RevisionCard
                  key={rev.problem_id}
                  revision={rev}
                  index={index}
                  completing={
                    completingId === rev.problem_id
                  }
                  onComplete={handleComplete}
                />
              ))}
            </div>
          ) : (
            <EmptyRevisionState />
          )}

          {/* REVISION PROGRESS */}
          {allRevisions.length > 0 && (
            <RevisionProgressSection
              stats={stats}
              progressPreview={progressPreview}
              showAll={showAll}
              setShowAll={setShowAll}
              search={search}
              setSearch={setSearch}
              filter={filter}
              setFilter={setFilter}
              visibleProgress={paginatedProgress}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalResults={visibleProgress.length}
            />
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

/* ───────────────────────────────────────────── */
/* REVISION PROGRESS */
/* ───────────────────────────────────────────── */

function RevisionProgressSection({
  stats,
  progressPreview,
  showAll,
  setShowAll,
  search,
  setSearch,
  filter,
  setFilter,
  visibleProgress,
  currentPage,
  setCurrentPage,
  totalPages,
  totalResults,
}: {
  stats: {
    activeCount: number;
    completedCount: number;
    totalTracked: number;
  };

  progressPreview: RevisionItem[];

  showAll: boolean;
  setShowAll: React.Dispatch<React.SetStateAction<boolean>>;

  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;

  filter: "ALL" | "ACTIVE" | "COMPLETED";
  setFilter: React.Dispatch<
    React.SetStateAction<
      "ALL" | "ACTIVE" | "COMPLETED"
    >
  >;

  visibleProgress: RevisionItem[];

  currentPage: number;
  setCurrentPage: React.Dispatch<
    React.SetStateAction<number>
  >;

  totalPages: number;
  totalResults: number;
}) {
  return (
    <section className="space-y-4">

      {/* SECTION HEADER */}
      <div className="flex flex-col justify-between gap-3 px-1 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-violet-400" />

            <h2 className="text-xl font-semibold tracking-tight text-white">
              Your revision progress
            </h2>
          </div>

          <p className="mt-1 text-sm text-zinc-500">
            Keep track of the problems you're reinforcing.
          </p>
        </div>

        <div className="text-xs text-zinc-500">
          {stats.totalTracked} problems tracked
        </div>
      </div>

      {/* OVERVIEW */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <ProgressStat
          label="In progress"
          value={stats.activeCount}
          icon={<RefreshCw />}
        />

        <ProgressStat
          label="Completed"
          value={stats.completedCount}
          icon={<CheckCircle2 />}
        />

        <div className="col-span-2 md:col-span-1">
          <ProgressStat
            label="Total tracked"
            value={stats.totalTracked}
            icon={<Layers3 />}
          />
        </div>
      </div>

      {!showAll ? (
        <>
          {/* PREVIEW */}
          {progressPreview.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Active revision progress
                    </h3>

                    <p className="mt-1 text-xs text-zinc-500">
                      Your next five scheduled reviews.
                    </p>
                  </div>

                  <span className="rounded-full border border-blue-400/10 bg-blue-400/[0.06] px-2.5 py-1 text-[10px] font-medium text-blue-300">
                    {stats.activeCount} active
                  </span>
                </div>
              </div>

              <div className="divide-y divide-white/[0.05]">
                {progressPreview.map((revision) => (
                  <ProgressRow
                    key={revision.problem_id}
                    revision={revision}
                  />
                ))}
              </div>

              <div className="border-t border-white/[0.06] p-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAll(true);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                >
                  View all revision progress
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300" />

              <p className="mt-3 text-sm font-medium text-white">
                No active revisions
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Your revision queue is clear.
              </p>
            </div>
          )}
        </>
      ) : (
        /* FULL LIST */
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl">

          {/* TOOLBAR */}
          <div className="space-y-3 border-b border-white/[0.06] p-4">

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search problems..."
                  className="h-10 w-full rounded-xl border border-white/[0.07] bg-black/20 pl-9 pr-9 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/20"
                />

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex rounded-xl border border-white/[0.07] bg-black/20 p-1">
                <FilterButton
                  active={filter === "ALL"}
                  onClick={() => setFilter("ALL")}
                >
                  All
                </FilterButton>

                <FilterButton
                  active={filter === "ACTIVE"}
                  onClick={() => setFilter("ACTIVE")}
                >
                  Active
                </FilterButton>

                <FilterButton
                  active={filter === "COMPLETED"}
                  onClick={() =>
                    setFilter("COMPLETED")
                  }
                >
                  Completed
                </FilterButton>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {totalResults}{" "}
                {totalResults === 1
                  ? "problem"
                  : "problems"}
              </span>

              <button
                onClick={() => {
                  setShowAll(false);
                  setSearch("");
                  setFilter("ALL");
                  setCurrentPage(1);
                }}
                className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
              >
                Collapse
              </button>
            </div>
          </div>

          {/* RESULTS */}
          {visibleProgress.length > 0 ? (
            <div className="divide-y divide-white/[0.05]">
              {visibleProgress.map((revision) => (
                <ProgressRow
                  key={revision.problem_id}
                  revision={revision}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Search className="mx-auto h-7 w-7 text-zinc-700" />

              <p className="mt-3 text-sm font-medium text-zinc-300">
                No matching revisions
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                Try a different problem or filter.
              </p>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

              {/* RANGE */}
              <span className="text-xs text-zinc-600">
                Showing{" "}
                {(currentPage - 1) *
                  ITEMS_PER_PAGE +
                  1}
                –
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  totalResults
                )}{" "}
                of {totalResults}
              </span>

              {/* CONTROLS */}
              <div className="flex items-center justify-between gap-1 sm:justify-end">

                <Button
                  variant="ghost"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(1, page - 1)
                    )
                  }
                  className="h-8 px-3 text-xs text-zinc-500 hover:bg-white/[0.04] hover:text-white disabled:opacity-30"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-0.5">
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  )
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(
                          page - currentPage
                        ) <= 1
                    )
                    .map(
                      (
                        page,
                        index,
                        pages
                      ) => {
                        const previous =
                          pages[index - 1];

                        return (
                          <div
                            key={page}
                            className="flex items-center"
                          >
                            {previous &&
                              page -
                                previous >
                                1 && (
                                <span className="px-1 text-xs text-zinc-700">
                                  ...
                                </span>
                              )}

                            <button
                              onClick={() =>
                                setCurrentPage(
                                  page
                                )
                              }
                              className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition-all ${
                                currentPage ===
                                page
                                  ? "bg-blue-500/10 text-blue-300"
                                  : "text-zinc-600 hover:bg-white/[0.04] hover:text-zinc-300"
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      }
                    )}
                </div>

                <Button
                  variant="ghost"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                    )
                  }
                  className="h-8 px-3 text-xs text-zinc-500 hover:bg-white/[0.04] hover:text-white disabled:opacity-30"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* SHOW LESS */}
          <div className="border-t border-white/[0.06] p-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowAll(false);
                setSearch("");
                setFilter("ALL");
                setCurrentPage(1);
              }}
              className="h-10 w-full text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            >
              <ChevronDown className="mr-2 h-4 w-4 rotate-180" />
              Show less
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ───────────────────────────────────────────── */
/* PROGRESS ROW */
/* ───────────────────────────────────────────── */

function ProgressRow({
  revision,
}: {
  revision: RevisionItem;
}) {
  const count = Math.min(
    revision.revision_count ?? 0,
    8
  );

  const progressPercent = Math.min(
    100,
    Math.round((count / 8) * 100)
  );

  const nextDate = revision.next_revision_date
    ? new Date(
        revision.next_revision_date
      ).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <div className="group flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center">

      {/* TITLE */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
              revision.is_completed
                ? "border-emerald-400/10 bg-emerald-400/[0.06]"
                : "border-blue-400/10 bg-blue-400/[0.06]"
            }`}
          >
            {revision.is_completed ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            ) : (
              <RefreshCw className="h-4 w-4 text-blue-300" />
            )}
          </div>

          <div className="min-w-0">
            <h4 className="truncate text-sm font-medium text-zinc-200 transition-colors group-hover:text-white">
              {revision.title}
            </h4>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-600">
              {revision.topic && (
                <span>{revision.topic}</span>
              )}

              {revision.topic && (
                <span className="h-1 w-1 rounded-full bg-zinc-700" />
              )}

              <span>
                {revision.is_completed
                  ? "Sequence completed"
                  : `Next review ${nextDate}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="w-full sm:w-44">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-zinc-600">
            Progress
          </span>

          <span className="text-[11px] font-medium text-zinc-400">
            {revision.is_completed
              ? "8 / 8"
              : `${count} / 8`}
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full transition-all ${
              revision.is_completed
                ? "bg-emerald-400"
                : "bg-gradient-to-r from-blue-500 to-cyan-400"
            }`}
            style={{
              width: `${
                revision.is_completed
                  ? 100
                  : progressPercent
              }%`,
            }}
          />
        </div>
      </div>

      {/* STATUS */}
      <div className="hidden w-24 justify-end sm:flex">
        {revision.is_completed ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-2.5 py-1 text-[10px] font-medium text-emerald-300">
            <Check className="h-3 w-3" />
            Completed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/10 bg-blue-400/[0.05] px-2.5 py-1 text-[10px] font-medium text-blue-300">
            Active
          </span>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────── */
/* PROGRESS STAT */
/* ───────────────────────────────────────────── */

function ProgressStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.035] text-zinc-400">
        <span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      </div>

      <div className="text-xl font-bold text-white">
        {value}
      </div>

      <div className="mt-1 text-xs text-zinc-500">
        {label}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────── */
/* FILTER BUTTON */
/* ───────────────────────────────────────────── */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "bg-white/[0.08] text-white"
          : "text-zinc-600 hover:text-zinc-300"
      }`}
    >
      {children}
    </button>
  );
}

/* ───────────────────────────────────────────── */
/* STAT CARD */
/* ───────────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: "blue" | "red" | "amber" | "violet";
}) {
  const accentClasses = {
    blue: "text-blue-300 bg-blue-400/[0.08] border-blue-400/10",
    red: "text-red-300 bg-red-400/[0.07] border-red-400/10",
    amber: "text-amber-300 bg-amber-400/[0.07] border-amber-400/10",
    violet:
      "text-violet-300 bg-violet-400/[0.07] border-violet-400/10",
  };

  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.11] hover:bg-white/[0.04]">
      <div
        className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg border ${accentClasses[accent]}`}
      >
        <span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      </div>

      <div className="text-xl font-bold text-white">
        {value}
      </div>

      <div className="mt-1 text-xs text-zinc-500">
        {label}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────── */
/* REVISION CARD */
/* ───────────────────────────────────────────── */

function RevisionCard({
  revision,
  index,
  completing,
  onComplete,
}: {
  revision: RevisionItem;
  index: number;
  completing: boolean;
  onComplete: (
    problemId: number,
    timeTaken?: number
  ) => void;
}) {
  const priority = revision.priorityLabel ?? "LOW";

  const priorityConfig = {
    HIGH: {
      label: "HIGH PRIORITY",
      icon: Flame,
      text: "text-red-300",
      bg: "bg-red-400/[0.07]",
      border: "border-red-400/15",
      glow: "group-hover:shadow-red-500/[0.05]",
      dot: "bg-red-400",
    },

    MEDIUM: {
      label: "MEDIUM PRIORITY",
      icon: Zap,
      text: "text-amber-300",
      bg: "bg-amber-400/[0.07]",
      border: "border-amber-400/15",
      glow: "group-hover:shadow-amber-500/[0.05]",
      dot: "bg-amber-400",
    },

    LOW: {
      label: "LOW PRIORITY",
      icon: Target,
      text: "text-emerald-300",
      bg: "bg-emerald-400/[0.07]",
      border: "border-emerald-400/15",
      glow: "group-hover:shadow-emerald-500/[0.05]",
      dot: "bg-emerald-400",
    },
  }[
    priority as "HIGH" | "MEDIUM" | "LOW"
  ] ?? {
    label: "LOW PRIORITY",
    icon: Target,
    text: "text-emerald-300",
    bg: "bg-emerald-400/[0.07]",
    border: "border-emerald-400/15",
    glow: "group-hover:shadow-emerald-500/[0.05]",
    dot: "bg-emerald-400",
  };

  const PriorityIcon = priorityConfig.icon;

  const confidence = Math.min(
    100,
    Math.max(
      0,
      Number(revision.confidence_rating) || 0
    )
  );

  const difficulty =
    revision.felt_difficulty?.toUpperCase() ||
    "MEDIUM";

  const difficultyClass =
    difficulty === "EASY"
      ? "text-emerald-300 bg-emerald-400/[0.07] border-emerald-400/10"
      : difficulty === "HARD"
        ? "text-red-300 bg-red-400/[0.07] border-red-400/10"
        : "text-amber-300 bg-amber-400/[0.07] border-amber-400/10";

  const handleOpenProblem = () => {
    if (!revision.question_link) return;

    window.open(
      revision.question_link,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-white/[0.13] hover:bg-white/[0.035] ${priorityConfig.glow} md:p-6`}
      style={{
        animation: "revisionCardIn 0.55s ease-out both",
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div
        className={`absolute bottom-0 left-0 top-0 w-[2px] ${priorityConfig.dot} opacity-70`}
      />

      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-blue-500/[0.035] blur-3xl transition-all duration-500 group-hover:bg-blue-500/[0.07]" />

      <div className="relative">

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider ${priorityConfig.bg} ${priorityConfig.border} ${priorityConfig.text}`}
              >
                <PriorityIcon className="h-3 w-3" />
                {priorityConfig.label}
              </span>

              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${difficultyClass}`}
              >
                {difficulty}
              </span>

              {revision.topic && (
                <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[10px] font-medium text-zinc-400">
                  {revision.topic}
                </span>
              )}
            </div>

            <h3 className="max-w-3xl text-lg font-semibold tracking-tight text-white transition-colors duration-300 group-hover:text-blue-100 md:text-xl">
              {revision.title}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" />

                Revision{" "}
                {Math.min(
                  (revision.revision_count ?? 0) + 1,
                  8
                )}{" "}
                of 8
              </span>

              {revision.priorityScore !== undefined && (
                <>
                  <span className="h-1 w-1 rounded-full bg-zinc-700" />

                  <span>
                    Priority score{" "}
                    <span className="font-medium text-zinc-400">
                      {Math.round(
                        revision.priorityScore
                      )}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          <div
            className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border md:flex ${priorityConfig.bg} ${priorityConfig.border}`}
          >
            <PriorityIcon
              className={`h-5 w-5 ${priorityConfig.text}`}
            />
          </div>
        </div>

        {/* METRICS */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-zinc-500">
                <Gauge className="h-3.5 w-3.5" />
                Confidence
              </span>

              <span className="text-xs font-semibold text-zinc-300">
                {confidence}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000"
                style={{
                  width: `${confidence}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-zinc-500">
                <RefreshCw className="h-3.5 w-3.5" />
                Progress
              </span>

              <span className="text-xs font-semibold text-zinc-300">
                {revision.revision_count ?? 0}/8
              </span>
            </div>

            <div className="flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    i <
                    (revision.revision_count ?? 0)
                      ? "bg-blue-400"
                      : i ===
                          (revision.revision_count ?? 0)
                        ? "bg-blue-400/40"
                        : "bg-white/[0.06]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            disabled={!revision.question_link}
            onClick={handleOpenProblem}
            className="h-10 border-white/[0.08] bg-white/[0.025] text-zinc-300 transition-all duration-300 hover:border-blue-400/20 hover:bg-blue-400/[0.06] hover:text-blue-200"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open on LeetCode
            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 opacity-60" />
          </Button>

          <Button
            disabled={completing}
            onClick={() =>
              onComplete(revision.problem_id)
            }
            className="group/complete h-10 border-0 bg-gradient-to-r from-blue-600 to-blue-500 px-5 font-medium text-white shadow-lg shadow-blue-500/10 transition-all duration-300 hover:from-blue-500 hover:to-cyan-500 hover:shadow-blue-500/20"
          >
            {completing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4 transition-transform group-hover/complete:scale-125" />
                Mark as Revised
                <ChevronRight className="ml-1.5 h-3.5 w-3.5 opacity-60 transition-transform group-hover/complete:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}

/* ───────────────────────────────────────────── */
/* EMPTY STATE */
/* ───────────────────────────────────────────── */

function EmptyRevisionState() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] px-6 py-16 text-center backdrop-blur-xl md:px-10">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.05] blur-3xl" />

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-2xl bg-emerald-400/10 blur-xl" />

          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06]">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
          </div>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-300" />

          <h2 className="text-xl font-semibold text-white">
            You're all caught up
          </h2>

          <Sparkles className="h-4 w-4 text-emerald-300" />
        </div>

        <p className="text-sm leading-6 text-zinc-500">
          No revisions are due right now. Your spaced
          repetition schedule is working quietly in the
          background.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-4 py-2 text-xs text-zinc-500">
          <Trophy className="h-3.5 w-3.5 text-blue-300" />
          Come back when your next review is due
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────── */
/* LOADING SKELETON */
/* ───────────────────────────────────────────── */

function RevisionSkeleton() {
  return (
    <div className="relative mx-auto max-w-6xl space-y-6 px-1">
      <div className="animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.025] p-8">
        <div className="h-5 w-32 rounded bg-white/[0.06]" />

        <div className="mt-5 h-10 w-2/3 rounded bg-white/[0.06]" />

        <div className="mt-3 h-4 w-1/2 rounded bg-white/[0.04]" />

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 rounded-2xl bg-white/[0.035]"
            />
          ))}
        </div>
      </div>

      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6"
        >
          <div className="h-5 w-28 rounded bg-white/[0.06]" />

          <div className="mt-4 h-6 w-2/3 rounded bg-white/[0.06]" />

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl bg-white/[0.035]" />

            <div className="h-16 rounded-xl bg-white/[0.035]" />
          </div>
        </div>
      ))}
    </div>
  );
}