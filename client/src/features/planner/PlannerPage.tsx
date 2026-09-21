/* eslint-disable prettier/prettier */

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { toast } from "sonner";

import PlannerSetup from "./PlannerSetup";
import PlannerWeekView from "./PlannerWeekView";
import PlannerProblemPicker from "./PlannerProblemPicker";

import {
  addPlannerItem,
  deletePlannerItem,
  generatePlannerDraft,
  getPlanner,
  savePlanner,
  updatePlannerItem,
} from "./planner.api";

import type {
  PlannerDifficulty,
  PlannerItem,
  PlannerPlan,
  PlannerSuggestion,
} from "./planner.types";

import {
  addDays,
  formatDate,
  formatWeekRange,
  getMonday,
} from "./planner.utils";

export default function PlannerPage() {
  /*
  |--------------------------------------------------------------------------
  | WEEK
  |--------------------------------------------------------------------------
  */

  const [weekStart, setWeekStart] =
    useState(() =>
      getMonday(new Date()),
    );

  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const [plan, setPlan] =
    useState<PlannerPlan | null>(null);

  const [items, setItems] =
    useState<PlannerItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [building, setBuilding] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | SETUP
  |--------------------------------------------------------------------------
  */

  const [showSetup, setShowSetup] =
    useState(false);

  const [selectedTopics, setSelectedTopics] =
    useState<string[]>([]);

  const [
    selectedDifficulties,
    setSelectedDifficulties,
  ] =
    useState<PlannerDifficulty[]>([
      "easy",
      "medium",
    ]);

  const [goalCount, setGoalCount] =
    useState(5);

  /*
  |--------------------------------------------------------------------------
  | ADD TASK
  |--------------------------------------------------------------------------
  */

  const [pickerDate, setPickerDate] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | CONFIRMATION
  |--------------------------------------------------------------------------
  */

  const [confirmAction, setConfirmAction] =
    useState<
      | {
          type: "delete";
          item: PlannerItem;
        }
      | {
          type: "reset-day";
          date: string;
        }
      | {
          type: "reset-week";
        }
      | {
          type: "rebuild";
        }
      | null
    >(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | DERIVED WEEK VALUES
  |--------------------------------------------------------------------------
  */

  const weekStartString =
    formatDate(weekStart);

  const weekEndString =
    formatDate(
      addDays(
        weekStart,
        6,
      ),
    );

  /*
  |--------------------------------------------------------------------------
  | LOAD PLAN
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const loadPlanner = async () => {
      setLoading(true);

      try {
        const result =
          await getPlanner(
            weekStartString,
          );

        if (cancelled) return;

        setPlan(result);

        setItems(
          result?.items ?? [],
        );

        if (result) {
          setGoalCount(
            result.goal_count,
          );
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

  /*
  |--------------------------------------------------------------------------
  | PROGRESS
  |--------------------------------------------------------------------------
  */

  const progress = useMemo(() => {
    const total = items.length;

    const solved =
      items.filter(
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

  /*
  |--------------------------------------------------------------------------
  | NAVIGATION
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | BUILD WEEK
  |--------------------------------------------------------------------------
  */

  const buildWeek = async () => {
    if (
      selectedTopics.length === 0
    ) {
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
      const draft =
        await generatePlannerDraft({
          weekStart:
            weekStartString,

          topics:
            selectedTopics,

          difficulties:
            selectedDifficulties,

          goalCount:
            Number(goalCount),

          mentorProblemIds: [],
        });

      if (!draft) {
        throw new Error(
          "Planner could not generate a draft.",
        );
      }

      if (
        !Array.isArray(
          draft.items,
        )
      ) {
        throw new Error(
          "Planner returned invalid tasks.",
        );
      }

      if (
        draft.items.length === 0
      ) {
        throw new Error(
          "No unsolved problems matched your selected topics and difficulties.",
        );
      }

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      |
      | savePlanner currently replaces the planner items for this week.
      | Rebuild is therefore protected by a confirmation modal.
      |
      */

      const savedPlan =
        await savePlanner({
          weekStart:
            weekStartString,

          weekEnd:
            weekEndString,

          goalCount:
            Number(
              draft.goalCount ??
                goalCount,
            ),

          items:
            draft.items.map(
              (item) => ({
                problemId:
                  Number(
                    item.problem_id,
                  ),

                plannedDate:
                  String(
                    item.planned_date,
                  ).slice(0, 10),

                position:
                  Number(
                    item.position ?? 0,
                  ),

                source:
                  item.source ??
                  "PLANNER",
              }),
            ),
        });

      setPlan(savedPlan);

      setItems(
        savedPlan.items,
      );

      setShowSetup(false);

      setConfirmAction(null);

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

  /*
  |--------------------------------------------------------------------------
  | MOVE ITEM
  |--------------------------------------------------------------------------
  */

  const moveItem = async (
    itemId: number,
    plannedDate: string,
  ) => {
    const item =
      items.find(
        (current) =>
          current.id === itemId,
      );

    if (!item) return;

    const currentDate =
      String(
        item.planned_date,
      ).slice(0, 10);

    if (
      currentDate === plannedDate
    ) {
      return;
    }

    const previousItems =
      items;

    /*
    |--------------------------------------------------------------------------
    | Optimistic update
    |--------------------------------------------------------------------------
    */

    setItems((current) =>
      current.map(
        (currentItem) =>
          currentItem.id ===
          itemId
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
        current.map(
          (currentItem) =>
            currentItem.id ===
            itemId
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

      setItems(
        previousItems,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to move problem",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN PROBLEM
  |--------------------------------------------------------------------------
  |
  | Planner does NOT solve problems.
  |
  | It sends the user to the Problems module,
  | which remains the source of truth for solving.
  |
  */

  const openProblem = (
    item: PlannerItem,
  ) => {
    window.location.href =
      `/problems?problemId=${item.problem_id}`;
  };

  /*
  |--------------------------------------------------------------------------
  | ADD PROBLEM
  |--------------------------------------------------------------------------
  */

  const handleAddProblem = (
    date: string,
  ) => {
    setPickerDate(date);
  };

  /*
  |--------------------------------------------------------------------------
  | ADD PROBLEM TO PLANNER
  |--------------------------------------------------------------------------
  */

  const addProblemToPlanner = async (
    problem: PlannerSuggestion,
    date: string,
  ) => {
    try {
      /*
      |--------------------------------------------------------------------------
      | Position
      |--------------------------------------------------------------------------
      */

      const existingForDay =
        items.filter(
          (item) =>
            String(
              item.planned_date,
            ).slice(0, 10) === date,
        );

      const nextPosition =
        existingForDay.length;

      /*
      |--------------------------------------------------------------------------
      | API
      |--------------------------------------------------------------------------
      */

      const added =
        await addPlannerItem({
          problemId:
            problem.problem_id,

          plannedDate:
            date,

          position:
            nextPosition,

          source: "USER",
        });

      /*
      |--------------------------------------------------------------------------
      | Add to local state
      |--------------------------------------------------------------------------
      */

      const enrichedItem: PlannerItem =
        {
          ...added,

          problem_id:
            problem.problem_id,

          title:
            problem.title,

          difficulty:
            problem.difficulty,

          topic:
            problem.topic,

          tags:
            problem.tags,

          platform:
            problem.platform,

          question_link:
            problem.question_link,

          solved:
            problem.solved,
        };

      setItems((current) => [
        ...current,
        enrichedItem,
      ]);

      setPickerDate(null);

      /*
      |--------------------------------------------------------------------------
      | If the week did not previously have
      | a plan, reload it so we get the
      | actual plan metadata.
      |--------------------------------------------------------------------------
      */

      if (!plan) {
        const refreshed =
          await getPlanner(
            weekStartString,
          );

        setPlan(refreshed);

        setItems(
          refreshed?.items ?? [
            enrichedItem,
          ],
        );
      }

      toast.success(
        "Problem added to your planner",
      );
    } catch (error) {
      console.error(
        "Failed to add planner problem:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add problem",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE SINGLE ITEM
  |--------------------------------------------------------------------------
  */

  const deleteProblem = async (
    item: PlannerItem,
  ) => {
    setActionLoading(true);

    try {
      await deletePlannerItem(
        item.id,
      );

      setItems((current) =>
        current.filter(
          (currentItem) =>
            currentItem.id !==
            item.id,
        ),
      );

      setConfirmAction(null);

      toast.success(
        "Problem removed from planner",
      );
    } catch (error) {
      console.error(
        "Failed to delete planner item:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove problem",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESET DAY
  |--------------------------------------------------------------------------
  */

  const resetDay = async (
    date: string,
  ) => {
    if (!plan) {
      setConfirmAction(null);
      return;
    }

    setActionLoading(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | Keep every item except this day.
      |--------------------------------------------------------------------------
      */

      const remainingItems =
        items.filter(
          (item) =>
            String(
              item.planned_date,
            ).slice(0, 10) !== date,
        );

      const savedPlan =
        await savePlanner({
          weekStart:
            weekStartString,

          weekEnd:
            weekEndString,

          goalCount:
            plan.goal_count,

          items:
            remainingItems.map(
              (item) => ({
                problemId:
                  item.problem_id,

                plannedDate:
                  String(
                    item.planned_date,
                  ).slice(0, 10),

                position:
                  item.position,

                source:
                  item.source,
              }),
            ),
        });

      setPlan(savedPlan);

      setItems(
        savedPlan.items,
      );

      setConfirmAction(null);

      toast.success(
        "Day cleared",
      );
    } catch (error) {
      console.error(
        "Failed to reset day:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to reset day",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESET WEEK
  |--------------------------------------------------------------------------
  */

  const resetWeek = async () => {
    if (!plan) {
      setConfirmAction(null);
      return;
    }

    setActionLoading(true);

    try {
      const savedPlan =
        await savePlanner({
          weekStart:
            weekStartString,

          weekEnd:
            weekEndString,

          goalCount:
            plan.goal_count,

          items: [],
        });

      setPlan(savedPlan);

      setItems([]);

      setConfirmAction(null);

      toast.success(
        "Week cleared",
      );
    } catch (error) {
      console.error(
        "Failed to reset week:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to reset week",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REBUILD CONFIRMATION
  |--------------------------------------------------------------------------
  */

  const handlePlanButton = () => {
    if (
      plan &&
      items.length > 0
    ) {
      setConfirmAction({
        type: "rebuild",
      });

      return;
    }

    setShowSetup(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CONFIRM ACTION
  |--------------------------------------------------------------------------
  */

  const handleConfirmAction =
    async () => {
      if (!confirmAction) {
        return;
      }

      if (
        confirmAction.type ===
        "delete"
      ) {
        await deleteProblem(
          confirmAction.item,
        );

        return;
      }

      if (
        confirmAction.type ===
        "reset-day"
      ) {
        await resetDay(
          confirmAction.date,
        );

        return;
      }

      if (
        confirmAction.type ===
        "reset-week"
      ) {
        await resetWeek();

        return;
      }

      if (
        confirmAction.type ===
        "rebuild"
      ) {
        setConfirmAction(null);
        setShowSetup(true);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

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
              Organize your DSA practice
              across the week.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {plan &&
              items.length > 0 && (
                <motion.button
                  whileHover={{
                    y: -1,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  type="button"
                  onClick={() =>
                    setConfirmAction(
                      {
                        type: "reset-week",
                      },
                    )
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
                >
                  <Trash2 className="h-4 w-4" />

                  Reset week
                </motion.button>
              )}

            <motion.button
              whileHover={{
                y: -1,
              }}
              whileTap={{
                scale: 0.97,
              }}
              type="button"
              onClick={
                handlePlanButton
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10"
            >
              <Sparkles className="h-4 w-4" />

              {plan
                ? "Rebuild week"
                : "Plan my week"}
            </motion.button>
          </div>
        </motion.div>

        {/* NAVIGATION */}

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
              whileTap={{
                scale: 0.9,
              }}
              type="button"
              onClick={
                goToPreviousWeek
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-muted"
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
              whileTap={{
                scale: 0.9,
              }}
              type="button"
              onClick={
                goToNextWeek
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-muted"
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
              {progress.total}{" "}
              completed
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

        {loading ? (
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
        ) : (
          <AnimatePresence
            mode="wait"
          >
            <motion.div
              key={weekStartString}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              <PlannerWeekView
                weekStart={
                  weekStart
                }
                items={items}
                onMoveItem={
                  moveItem
                }
                onOpenProblem={
                  openProblem
                }
                onAddProblem={
                  handleAddProblem
                }
                onDeleteProblem={(
                  item,
                ) =>
                  setConfirmAction(
                    {
                      type: "delete",
                      item,
                    },
                  )
                }
                onResetDay={(date) =>
                  setConfirmAction(
                    {
                      type: "reset-day",
                      date,
                    },
                  )
                }
              />
            </motion.div>
          </AnimatePresence>
        )}

        {/* WEEK BUILDER */}

        <AnimatePresence>
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
        </AnimatePresence>

        {/* ADD TASK PICKER */}

        <AnimatePresence>
          {pickerDate && (
            <PlannerProblemPicker
              date={
                pickerDate
              }
              existingProblemIds={items.map(
                (item) =>
                  item.problem_id,
              )}
              onAdd={
                addProblemToPlanner
              }
              onClose={() =>
                setPickerDate(null)
              }
            />
          )}
        </AnimatePresence>

        {/* CONFIRMATION MODAL */}

        <AnimatePresence>
          {confirmAction && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 5,
                  scale: 0.98,
                }}
                className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl"
              >
                <div className="flex gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                    <AlertTriangle className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground">
                      {confirmAction.type ===
                      "delete"
                        ? "Remove this task?"
                        : confirmAction.type ===
                            "reset-day"
                          ? "Reset this day?"
                          : confirmAction.type ===
                              "reset-week"
                            ? "Reset this week?"
                            : "Rebuild this week?"}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {confirmAction.type ===
                      "delete"
                        ? "This removes the problem from your planner only. Your solved status and Problems data are not affected."
                        : confirmAction.type ===
                            "reset-day"
                          ? "All planned problems on this day will be removed from the planner."
                          : confirmAction.type ===
                              "reset-week"
                            ? "All planned problems for this week will be removed from the planner."
                            : "Your current weekly arrangement will be replaced with a new generated draft."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      setConfirmAction(
                        null,
                      )
                    }
                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={
                      handleConfirmAction
                    }
                    className={[
                      "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50",
                      confirmAction.type ===
                        "rebuild"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                    ].join(" ")}
                  >
                    {actionLoading && (
                      <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                    )}

                    {confirmAction.type ===
                    "rebuild"
                      ? "Continue"
                      : "Confirm"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}