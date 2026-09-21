/* eslint-disable prettier/prettier */

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import PlannerSetup from "./PlannerSetup";
import PlannerWeekView from "./PlannerWeekView";
import PlannerCalendar from "./PlannerCalendar";

import {
  generatePlannerDraft,
  getPlanner,
  savePlanner,
  updatePlannerItem,
} from "./planner.api";

import type {
  PlannerDifficulty,
  PlannerItem,
  PlannerPlan,
} from "./planner.types";

import {
  addDays,
  formatDate,
  formatWeekRange,
  getMonday,
} from "./planner.utils";

type ViewMode = "week" | "calendar";

export default function PlannerPage() {
  // --------------------------------------------------
  // WEEK
  // --------------------------------------------------

  const [weekStart, setWeekStart] = useState(() =>
    getMonday(new Date()),
  );

  // --------------------------------------------------
  // PLANNER DATA
  // --------------------------------------------------

  const [plan, setPlan] = useState<PlannerPlan | null>(null);
  const [items, setItems] = useState<PlannerItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);

  // --------------------------------------------------
  // SETUP STATE
  // --------------------------------------------------

  const [showSetup, setShowSetup] = useState(false);

  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    [],
  );

  const [selectedDifficulties, setSelectedDifficulties] =
    useState<PlannerDifficulty[]>([
      "easy",
      "medium",
    ]);

  const [goalCount, setGoalCount] = useState(5);

  // --------------------------------------------------
  // VIEW
  // --------------------------------------------------

  const [viewMode, setViewMode] =
    useState<ViewMode>("week");

  // --------------------------------------------------
  // DATES
  // --------------------------------------------------

  const weekStartString = formatDate(weekStart);

  // --------------------------------------------------
  // LOAD EXISTING PLAN
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadPlanner = async () => {
      setLoading(true);

      try {
        const result = await getPlanner(
          weekStartString,
        );

        if (cancelled) return;

        setPlan(result);
        setItems(result?.items ?? []);

        if (result) {
          setGoalCount(result.goal_count);
        }
      } catch (error) {
        console.error(
          "Failed to load planner:",
          error,
        );

        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load planner",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPlanner();

    return () => {
      cancelled = true;
    };
  }, [weekStartString]);

  // --------------------------------------------------
  // PROGRESS
  // --------------------------------------------------

  const progress = useMemo(() => {
    const total = items.length;

    const solved = items.filter(
      (item) => item.solved,
    ).length;

    return {
      total,
      solved,
      remaining: Math.max(
        total - solved,
        0,
      ),
      percentage:
        total === 0
          ? 0
          : Math.round(
              (solved / total) * 100,
            ),
    };
  }, [items]);

  // --------------------------------------------------
  // WEEK NAVIGATION
  // --------------------------------------------------

  const goToPreviousWeek = () => {
    setWeekStart((current) =>
      addDays(current, -7),
    );
  };

  const goToNextWeek = () => {
    setWeekStart((current) =>
      addDays(current, 7),
    );
  };

  const goToCurrentWeek = () => {
    setWeekStart(
      getMonday(new Date()),
    );
  };

  // --------------------------------------------------
  // BUILD WEEK
  // --------------------------------------------------

  const buildWeek = async () => {
    if (selectedTopics.length === 0) {
      toast.error(
        "Select at least one topic",
      );
      return;
    }

    if (
      selectedDifficulties.length === 0
    ) {
      toast.error(
        "Select at least one difficulty",
      );
      return;
    }

    setBuilding(true);

    try {
      // 1. Generate draft
      const draft =
        await generatePlannerDraft({
          weekStart: weekStartString,
          topics: selectedTopics,
          difficulties:
            selectedDifficulties,
          goalCount,
          mentorProblemIds: [],
        });

      // 2. Save generated draft
      const savedPlan =
        await savePlanner({
          weekStart: draft.weekStart,
          weekEnd: draft.weekEnd,
          goalCount: draft.goalCount,
          items: draft.items.map(
            (item) => ({
              problemId:
                item.problem_id,
              plannedDate:
                item.planned_date,
              position:
                item.position,
              source:
                item.source,
            }),
          ),
        });

      // 3. Update UI
      setPlan(savedPlan);
      setItems(savedPlan.items);

      setShowSetup(false);

      toast.success(
        "Your week is ready",
      );
    } catch (error) {
      console.error(
        "Failed to build planner:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to build your week",
      );
    } finally {
      setBuilding(false);
    }
  };

  // --------------------------------------------------
  // MOVE ITEM
  // --------------------------------------------------

  const moveItem = async (
    itemId: number,
    plannedDate: string,
  ) => {
    const item = items.find(
      (current) =>
        current.id === itemId,
    );

    if (!item) return;

    const previousItems = items;

    // Optimistic update
    setItems((current) =>
      current.map((currentItem) =>
        currentItem.id === itemId
          ? {
              ...currentItem,
              planned_date:
                plannedDate,
            }
          : currentItem,
      ),
    );

    try {
      const updatedItem =
        await updatePlannerItem(
          itemId,
          {
            plannedDate,
            position:
              item.position,
          },
        );

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === itemId
            ? {
                ...currentItem,
                planned_date:
                  updatedItem.planned_date,
                position:
                  updatedItem.position,
              }
            : currentItem,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to move planner item:",
        error,
      );

      // Roll back
      setItems(previousItems);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to move problem",
      );
    }
  };

  // --------------------------------------------------
  // OPEN PROBLEM
  // --------------------------------------------------

  const openProblem = (
    item: PlannerItem,
  ) => {
    if (!item.question_link) return;

    window.open(
      item.question_link,
      "_blank",
      "noopener,noreferrer",
    );
  };

  // --------------------------------------------------
  // ADD PROBLEM
  // --------------------------------------------------

  const handleAddProblem = (
    date: string,
  ) => {
    console.log(
      "Add problem for:",
      date,
    );

    // Problem picker will be added later.
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-[1600px] px-6 py-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>Practice</span>
              <span>/</span>
              <span>Planner</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Weekly Planner
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Decide what you're going to
              practice this week.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!loading && plan && (
              <button
                type="button"
                onClick={() =>
                  setShowSetup(true)
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted"
              >
                <Sparkles className="h-4 w-4" />
                Edit week
              </button>
            )}

            {!loading && !plan && (
              <button
                type="button"
                onClick={() =>
                  setShowSetup(true)
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" />
                Build My Week
              </button>
            )}
          </div>
        </div>

        {/* WEEK NAVIGATION */}
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={
                goToPreviousWeek
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={
                goToCurrentWeek
              }
              className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition hover:bg-muted"
            >
              Today
            </button>

            <button
              type="button"
              onClick={
                goToNextWeek
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="ml-2 text-sm font-medium">
              {formatWeekRange(
                weekStart,
              )}
            </div>
          </div>

          {/* VIEW SWITCH */}
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">

            <button
              type="button"
              onClick={() =>
                setViewMode("week")
              }
              className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${
                viewMode === "week"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListTodo className="h-4 w-4" />
              Week
            </button>

            <button
              type="button"
              onClick={() =>
                setViewMode(
                  "calendar",
                )
              }
              className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${
                viewMode === "calendar"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </button>

          </div>
        </div>

        {/* PROGRESS */}
        {plan && !loading && (
          <div className="mb-5 rounded-xl border border-border bg-card p-4 shadow-sm">

            <div className="flex items-center justify-between gap-4">

              <div>
                <p className="text-sm font-medium">
                  This week's progress
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {progress.solved} of{" "}
                  {progress.total}{" "}
                  planned problems
                  solved
                </p>
              </div>

              <span className="text-sm font-semibold">
                {progress.percentage}%
              </span>

            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${progress.percentage}%`,
                }}
              />
            </div>

          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-border bg-card">
            <div className="text-center">

              <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />

              <p className="text-sm text-muted-foreground">
                Loading your planner...
              </p>

            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !plan && (
          <div className="flex min-h-[480px] items-center justify-center rounded-xl border border-dashed border-border bg-card">

            <div className="max-w-md px-6 text-center">

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <CalendarDays className="h-7 w-7 text-primary" />
              </div>

              <h2 className="text-xl font-semibold">
                Plan your week
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Choose the topics you
                want to practice, set
                your weekly goal, and
                Dykstra will build a
                focused plan for you.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowSetup(true)
                }
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" />
                Build My Week
              </button>

            </div>
          </div>
        )}

        {/* PLANNER */}
        {!loading && plan && (
          <>
            {viewMode === "week" ? (
              <PlannerWeekView
                weekStart={weekStart}
                items={items}
                onDropItem={
                  moveItem
                }
                onOpenProblem={
                  openProblem
                }
                onAddProblem={
                  handleAddProblem
                }
              />
            ) : (
              <PlannerCalendar
                weekStart={weekStart}
                items={items}
                onOpenProblem={
                  openProblem
                }
              />
            )}
          </>
        )}

        {/* SETUP MODAL */}
        {showSetup && (
          <PlannerSetup
            selectedTopics={
              selectedTopics
            }
            selectedDifficulties={
              selectedDifficulties
            }
            goalCount={
              goalCount
            }
            onTopicsChange={
              setSelectedTopics
            }
            onDifficultiesChange={
              setSelectedDifficulties
            }
            onGoalCountChange={
              setGoalCount
            }
            onBuild={
              buildWeek
            }
            onClose={() =>
              setShowSetup(false)
            }
            loading={
              building
            }
          />
        )}

      </div>
    </div>
  );
}