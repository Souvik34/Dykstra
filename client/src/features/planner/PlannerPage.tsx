/* eslint-disable prettier/prettier */

import { useMemo, useState } from "react";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import PlannerSetup from "./PlannerSetup";
import PlannerWeekView from "./PlannerWeekView";
import PlannerCalendar from "./PlannerCalendar";

import type {
  PlannerDifficulty,
  PlannerItem,
} from "./planner.types";

import {
  addDays,
  formatDate,
  formatWeekRange,
  getMonday,
} from "./planner.utils";

type PlannerView = "week" | "calendar";

export default function PlannerPage() {
  const [weekStart, setWeekStart] =
    useState(() =>
      getMonday(new Date()),
    );

  const [view, setView] =
    useState<PlannerView>("week");

  const [showSetup, setShowSetup] =
    useState(false);

  const [selectedTopics, setSelectedTopics] =
    useState<string[]>([]);

  const [
    selectedDifficulties,
    setSelectedDifficulties,
  ] = useState<PlannerDifficulty[]>([
    "easy",
    "medium",
  ]);

  const [goalCount, setGoalCount] =
    useState(5);

  const [building, setBuilding] =
    useState(false);

  const [items, setItems] =
    useState<PlannerItem[]>([]);

  const weekEnd = useMemo(
    () => addDays(weekStart, 6),
    [weekStart],
  );

  const solvedCount = items.filter(
    (item) => item.solved,
  ).length;

  const progress =
    items.length === 0
      ? 0
      : Math.round(
          (solvedCount /
            items.length) *
            100,
        );

  const moveItem = (
    itemId: number,
    plannedDate: string,
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              planned_date:
                plannedDate,
            }
          : item,
      ),
    );
  };

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

  const handleAddProblem = (
    date: string,
  ) => {
    console.log(
      "Add problem to:",
      date,
    );

    /*
     * Next:
     * open the existing Dykstra problem
     * picker here.
     */
  };

  const buildWeek = async () => {
    setBuilding(true);

    try {
      /*
       * API wiring comes here.
       *
       * POST /api/v1/planner/draft
       */

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 500),
      );

      setShowSetup(false);
    } finally {
      setBuilding(false);
    }
  };

  const previousWeek = () => {
    setWeekStart((current) =>
      addDays(current, -7),
    );
  };

  const nextWeek = () => {
    setWeekStart((current) =>
      addDays(current, 7),
    );
  };

  const today = () => {
    setWeekStart(
      getMonday(new Date()),
    );
  };

  return (
    <div className="min-h-full bg-black px-6 py-6 text-white">
      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10 text-blue-300">
              <CalendarDays className="h-4 w-4" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              Planner
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Your week, planned.
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Focus on solving. Dykstra handles
            the plan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={today}
            className="border-white/10 bg-white/[0.025] text-slate-300 hover:bg-white/[0.06] hover:text-white"
          >
            Today
          </Button>

          <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.025]">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousWeek}
              className="h-9 w-9 text-slate-400 hover:bg-white/[0.05] hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextWeek}
              className="h-9 w-9 text-slate-400 hover:bg-white/[0.05] hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* VIEW SWITCH */}

          <div className="flex rounded-lg border border-white/10 bg-white/[0.025] p-0.5">
            <button
              type="button"
              onClick={() =>
                setView("week")
              }
              className={[
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                view === "week"
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-500 hover:text-slate-300",
              ].join(" ")}
            >
              Week
            </button>

            <button
              type="button"
              onClick={() =>
                setView("calendar")
              }
              className={[
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                view === "calendar"
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-500 hover:text-slate-300",
              ].join(" ")}
            >
              Calendar
            </button>
          </div>

          <Button
            onClick={() =>
              setShowSetup(true)
            }
            className="gap-2 bg-blue-500 text-white shadow-[0_0_30px_-12px_rgba(59,130,246,0.9)] hover:bg-blue-400"
          >
            {items.length > 0 ? (
              <>
                <Pencil className="h-4 w-4" />
                Edit week
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Build my week
              </>
            )}
          </Button>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium text-slate-200">
            {formatWeekRange(
              weekStart,
            )}
          </div>

          <div className="mt-1 text-xs text-slate-500">
            {items.length === 0
              ? "Your week is waiting to be planned."
              : `${solvedCount} of ${items.length} problems completed`}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-1.5 w-36 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <span className="text-xs font-semibold text-slate-400">
            {progress}%
          </span>
        </div>
      </div>

      {/* EMPTY STATE */}

      {items.length === 0 ? (
        <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.012]">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-blue-400/10 bg-blue-500/[0.06] text-blue-300 shadow-[0_0_50px_-25px_rgba(59,130,246,0.8)]">
              <Sparkles className="h-6 w-6" />
            </div>

            <h2 className="text-lg font-semibold text-slate-200">
              Your week isn't planned yet.
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Choose the topics and workload you
              want to focus on. Dykstra will build
              the first version of your week.
            </p>

            <Button
              onClick={() =>
                setShowSetup(true)
              }
              className="mt-5 gap-2 bg-blue-500 text-white hover:bg-blue-400"
            >
              <Sparkles className="h-4 w-4" />
              Build my week
            </Button>
          </div>
        </div>
      ) : view === "week" ? (
        <PlannerWeekView
          weekStart={weekStart}
          items={items}
          onMoveItem={moveItem}
          onOpenProblem={openProblem}
          onAddProblem={
            handleAddProblem
          }
        />
      ) : (
        <PlannerCalendar
          weekStart={weekStart}
          items={items}
          onOpenProblem={openProblem}
        />
      )}

      {/* SETUP */}

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
    </div>
  );
}