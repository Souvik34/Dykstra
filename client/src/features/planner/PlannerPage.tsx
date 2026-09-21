/* eslint-disable prettier/prettier */

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import PlannerSetup from "./PlannerSetup";
import PlannerWeekView from "./PlannerWeekView";

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

export default function PlannerPage() {
  const [weekStart, setWeekStart] = useState(() =>
    getMonday(new Date()),
  );

  const [plan, setPlan] =
    useState<PlannerPlan | null>(null);

  const [items, setItems] =
    useState<PlannerItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [building, setBuilding] =
    useState(false);

  const [showSetup, setShowSetup] =
    useState(false);

  const [selectedTopics, setSelectedTopics] =
    useState<string[]>([]);

  const [selectedDifficulties, setSelectedDifficulties] =
    useState<PlannerDifficulty[]>([
      "easy",
      "medium",
    ]);

  const [goalCount, setGoalCount] =
    useState(5);

  const weekStartString =
    formatDate(weekStart);

  // --------------------------------------------------
  // LOAD PLAN
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
      percentage:
        total === 0
          ? 0
          : Math.round(
              (solved / total) * 100,
            ),
    };
  }, [items]);

  // --------------------------------------------------
  // NAVIGATION
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
    toast.error("Select at least one topic");
    return;
  }

  if (selectedDifficulties.length === 0) {
    toast.error("Select at least one difficulty");
    return;
  }

  setBuilding(true);

  try {
    const draft = await generatePlannerDraft({
      weekStart: weekStartString,
      topics: selectedTopics,
      difficulties: selectedDifficulties,
      goalCount,
      mentorProblemIds: [],
    });

    if (!draft) {
      throw new Error(
        "Planner could not generate a draft.",
      );
    }

    if (!Array.isArray(draft.items)) {
      throw new Error(
        "Planner returned invalid tasks.",
      );
    }

    if (draft.items.length === 0) {
      throw new Error(
        "No unsolved problems matched your selected topics and difficulties.",
      );
    }

    // weekEnd is deterministic.
    // Do not depend on the draft endpoint returning it.
    const weekEnd = formatDate(
      addDays(weekStart, 6),
    );

    const savedPlan = await savePlanner({
      weekStart: weekStartString,
      weekEnd,
      goalCount: Number(
        draft.goalCount || goalCount,
      ),
      items: draft.items.map((item) => ({
        problemId: Number(item.problem_id),
        plannedDate:
          item.planned_date.slice(0, 10),
        position: Number(item.position),
        source: item.source ?? "PLANNER",
      })),
    });

    setPlan(savedPlan);
    setItems(savedPlan.items);
    setShowSetup(false);

    toast.success("Your week is ready");
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
  // MOVE TASK
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

    if (
      item.planned_date.slice(0, 10) ===
      plannedDate
    ) {
      return;
    }

    const previousItems = items;

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
      "Add problem:",
      date,
    );

    // Problem picker comes next.
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-[1800px] px-4 py-5 sm:px-6 lg:px-8">

        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: -8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
          }}
          className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />

              <span>Practice</span>

              <span className="text-muted-foreground/40">
                /
              </span>

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

          {/* {!loading && (
            <motion.button
              whileHover={{
                y: -1,
              }}
              whileTap={{
                scale: 0.97,
              }}
              type="button"
              onClick={() =>
                setShowSetup(true)
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition hover:shadow-primary/20"
            >
              <Sparkles className="h-4 w-4" />

              {plan
                ? "Edit week"
                : "Build My Week"}
            </motion.button>
          )} */}
        </motion.div>

        {/* NAVIGATION BAR */}

        <motion.div
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.05,
            duration: 0.35,
          }}
          className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card/70 px-2 py-2 shadow-sm backdrop-blur"
        >
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{
                backgroundColor:
                  "rgba(255,255,255,0.05)",
              }}
              whileTap={{
                scale: 0.92,
              }}
              type="button"
              onClick={
                goToPreviousWeek
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileTap={{
                scale: 0.96,
              }}
              type="button"
              onClick={
                goToCurrentWeek
              }
              className="h-9 rounded-lg px-3 text-xs font-medium transition hover:bg-muted"
            >
              Today
            </motion.button>

            <motion.button
              whileHover={{
                backgroundColor:
                  "rgba(255,255,255,0.05)",
              }}
              whileTap={{
                scale: 0.92,
              }}
              type="button"
              onClick={goToNextWeek}
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>

            <div className="ml-2 hidden text-sm font-medium sm:block">
              {formatWeekRange(
                weekStart,
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pr-2">
            <div className="hidden text-xs text-muted-foreground sm:block">
              {progress.solved}/
              {progress.total} completed
            </div>

            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:w-28">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${progress.percentage}%`,
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                }}
                className="h-full rounded-full bg-primary"
              />
            </div>

            <span className="text-xs font-medium">
              {progress.percentage}%
            </span>
          </div>
        </motion.div>

        {/* LOADING */}

        {loading && (
          <div className="flex min-h-[560px] items-center justify-center rounded-2xl border border-border bg-card">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="h-6 w-6 rounded-full border-2 border-muted border-t-primary"
            />
          </div>
        )}

        {/* EMPTY */}

        <AnimatePresence mode="wait">
          {!loading && !plan && (
            <motion.div
              key="empty"
              initial={{
                opacity: 0,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.98,
              }}
              className="flex min-h-[560px] items-center justify-center rounded-2xl border border-dashed border-border bg-card"
            >
              <div className="max-w-md px-6 text-center">
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
                >
                  <CalendarDays className="h-7 w-7 text-primary" />
                </motion.div>

                <h2 className="text-xl font-semibold">
                  Plan your week
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Choose the topics you
                  want to practice and
                  Dykstra will arrange your
                  problems across the week.
                </p>

                <motion.button
                  whileHover={{
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                  type="button"
                  onClick={() =>
                    setShowSetup(true)
                  }
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10"
                >
                  <Sparkles className="h-4 w-4" />
                  Build My Week
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WEEK BOARD */}

        {/* {!loading && plan && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
          >
            <PlannerWeekView
              weekStart={weekStart}
              items={items}
              onMoveItem={moveItem}
              onOpenProblem={openProblem}
              onAddProblem={
                handleAddProblem
              }
            />
          </motion.div>
        )} */}

        {/* SETUP */}

        <AnimatePresence>
          {showSetup && (
            <PlannerSetup
              selectedTopics={
                selectedTopics
              }
              selectedDifficulties={
                selectedDifficulties
              }
              goalCount={goalCount}
              onTopicsChange={
                setSelectedTopics
              }
              onDifficultiesChange={
                setSelectedDifficulties
              }
              onGoalCountChange={
                setGoalCount
              }
              onBuild={buildWeek}
              onClose={() =>
                setShowSetup(false)
              }
              loading={building}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}