/* eslint-disable prettier/prettier */

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  RotateCcw,
  Sparkles,
  Target,
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
  getPlannerLeaves,
  removePlannerLeave,
  savePlanner,
  setPlannerLeave,
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

  const [leaves, setLeaves] =
    useState<string[]>([]);

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

        const leaveResult =
          await getPlannerLeaves(
            weekStartString,
          );

        if (cancelled) return;

        const leaveDates = (
          leaveResult?.data ?? []
        ).map(
          (leave: {
            leave_date: string;
          }) =>
            String(
              leave.leave_date,
            ).slice(0, 10),
        );

        setLeaves(
          leaveDates,
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

      setLeaves(
        (savedPlan.leaves ?? []).map(
          (leave: {
            leave_date: string;
          }) =>
            String(
              leave.leave_date,
            ).slice(0, 10),
        ),
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

    if (
      leaves.includes(
        plannedDate,
      )
    ) {
      toast.error(
        "Cannot move a task to a leave day",
      );
      return;
    }

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
    if (
      leaves.includes(date)
    ) {
      toast.error(
        "Cannot add a task to a leave day",
      );
      return;
    }

    setPickerDate(date);
  };

  /*
  |--------------------------------------------------------------------------
  | SET LEAVE
  |--------------------------------------------------------------------------
  */

  const handleSetLeave = async (
    date: string,
  ) => {
    try {
      const result =
        await setPlannerLeave({
          weekStart:
            weekStartString,
          leaveDate: date,
        });

      const updatedPlan =
        result?.data ?? result;

      setPlan(updatedPlan);

      setItems(
        updatedPlan?.items ?? [],
      );

      setLeaves(
        (
          updatedPlan?.leaves ??
          []
        ).map(
          (leave: {
            leave_date: string;
          }) =>
            String(
              leave.leave_date,
            ).slice(0, 10),
        ),
      );

      toast.success(
        "Leave added. Planner reorganized.",
      );
    } catch (error) {
      console.error(
        "Failed to set planner leave:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to set leave",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE LEAVE
  |--------------------------------------------------------------------------
  */

  const handleRemoveLeave = async (
    date: string,
  ) => {
    try {
      const result =
        await removePlannerLeave({
          weekStart:
            weekStartString,
          leaveDate: date,
        });

      const updatedPlan =
        result?.data ?? result;

      setPlan(updatedPlan);

      setItems(
        updatedPlan?.items ?? [],
      );

      setLeaves(
        (
          updatedPlan?.leaves ??
          []
        ).map(
          (leave: {
            leave_date: string;
          }) =>
            String(
              leave.leave_date,
            ).slice(0, 10),
        ),
      );

      toast.success(
        "Leave removed.",
      );
    } catch (error) {
      console.error(
        "Failed to remove planner leave:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove leave",
      );
    }
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
    if (
      leaves.includes(date)
    ) {
      toast.error(
        "Cannot add a task to a leave day",
      );
      return;
    }

    try {
      const existingForDay =
        items.filter(
          (item) =>
            String(
              item.planned_date,
            ).slice(0, 10) === date,
        );

      const nextPosition =
        existingForDay.length;

      const added =
        await addPlannerItem({
          weekStart:
            weekStartString,

          problemId:
            problem.problem_id,

          plannedDate:
            date,

          position:
            nextPosition,

          source: "USER",
        });

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

        const refreshedLeaves =
          await getPlannerLeaves(
            weekStartString,
          );

        setLeaves(
          (
            refreshedLeaves?.data ??
            []
          ).map(
            (leave: {
              leave_date: string;
            }) =>
              String(
                leave.leave_date,
              ).slice(0, 10),
          ),
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

    if (
      leaves.includes(date)
    ) {
      setConfirmAction(null);
      return;
    }

    setActionLoading(true);

    try {
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

      setLeaves(
        (savedPlan.leaves ?? []).map(
          (leave: {
            leave_date: string;
          }) =>
            String(
              leave.leave_date,
            ).slice(0, 10),
        ),
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

      setLeaves(
        (savedPlan.leaves ?? []).map(
          (leave: {
            leave_date: string;
          }) =>
            String(
              leave.leave_date,
            ).slice(0, 10),
        ),
      );

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
    <div className="min-h-full bg-slate-400">
      <div className="mx-auto max-w-[1800px] px-4 py-7 sm:px-6 lg:px-8">

        {/* PAGE HEADER */}

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
          className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
              <CalendarDays className="h-4 w-4 text-indigo-600" />

              <span>Practice</span>

              <span className="text-slate-300">
                /
              </span>

              <span className="text-slate-900">
                Planner
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Weekly Planner
            </h1>

            <p className="mt-2 text-base font-medium text-slate-600">
              Organize your DSA practice
              across the week.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
                    setConfirmAction({
                      type: "reset-week",
                    })
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <Trash2 className="h-4 w-4 text-slate-500" />

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
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />

              {plan
                ? "Rebuild week"
                : "Plan my week"}
            </motion.button>
          </div>
        </motion.div>

        {/* WEEK SUMMARY */}

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
          className="mb-5 grid gap-3 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Target className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Weekly goal
                </p>

                <p className="mt-0.5 text-xl font-bold text-slate-950">
                  {goalCount} problems
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Completed
                </p>

                <p className="mt-0.5 text-xl font-bold text-slate-950">
                  {progress.solved} /{" "}
                  {progress.total}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <ListChecks className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Progress
                  </p>

                  <span className="text-sm font-bold text-slate-950">
                    {progress.percentage}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
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
                    className="h-full rounded-full bg-violet-500"
                  />
                </div>
              </div>
            </div>
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
            delay: 0.1,
            duration: 0.35,
          }}
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
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
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileTap={{
                scale: 0.96,
              }}
              type="button"
              onClick={
                goToCurrentWeek
              }
              className="h-10 rounded-xl px-4 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
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
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100"
              aria-label="Next week"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>

            <div className="ml-3 border-l border-slate-200 pl-4 text-sm font-bold text-slate-900 sm:text-base">
              {formatWeekRange(
                weekStart,
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />

            <span className="text-sm font-semibold text-slate-700">
              {progress.solved}/
              {progress.total} completed
            </span>
          </div>
        </motion.div>

        {/* LOADING */}

        {loading ? (
          <div className="flex min-h-[560px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="h-7 w-7 rounded-full border-2 border-slate-200 border-t-indigo-600"
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
                leaves={leaves}
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
                  setConfirmAction({
                    type: "delete",
                    item,
                  })
                }
                onResetDay={(date) =>
                  setConfirmAction({
                    type: "reset-day",
                    date,
                  })
                }
                onSetLeave={
                  handleSetLeave
                }
                onRemoveLeave={
                  handleRemoveLeave
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
              className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
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
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
              >
                <div className="flex gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
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

                    <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">
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

                <div className="mt-7 flex justify-end gap-2">
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
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
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
                      "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-50",
                      confirmAction.type ===
                        "rebuild"
                        ? "bg-slate-950 text-white hover:bg-slate-800"
                        : "bg-red-600 text-white hover:bg-red-700",
                    ].join(" ")}
                  >
                    {actionLoading && (
                      <RotateCcw className="h-4 w-4 animate-spin" />
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