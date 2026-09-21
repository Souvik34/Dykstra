/* eslint-disable prettier/prettier */

import {
  Check,
  Minus,
  Plus,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DIFFICULTIES,
  TOPICS,
} from "./planner.utils";

import type {
  PlannerDifficulty,
} from "./planner.types";

interface PlannerSetupProps {
  selectedTopics: string[];
  selectedDifficulties: PlannerDifficulty[];
  goalCount: number;

  onTopicsChange: (
    topics: string[],
  ) => void;

  onDifficultiesChange: (
    difficulties: PlannerDifficulty[],
  ) => void;

  onGoalCountChange: (
    count: number,
  ) => void;

  onBuild: () => void;
  onClose?: () => void;

  loading?: boolean;
}

export default function PlannerSetup({
  selectedTopics,
  selectedDifficulties,
  goalCount,
  onTopicsChange,
  onDifficultiesChange,
  onGoalCountChange,
  onBuild,
  onClose,
  loading = false,
}: PlannerSetupProps) {
  const toggleTopic = (
    topic: string,
  ) => {
    if (
      selectedTopics.includes(topic)
    ) {
      onTopicsChange(
        selectedTopics.filter(
          (item) => item !== topic,
        ),
      );
    } else {
      onTopicsChange([
        ...selectedTopics,
        topic,
      ]);
    }
  };

  const toggleDifficulty = (
    difficulty: PlannerDifficulty,
  ) => {
    if (
      selectedDifficulties.includes(
        difficulty,
      )
    ) {
      onDifficultiesChange(
        selectedDifficulties.filter(
          (item) =>
            item !== difficulty,
        ),
      );
    } else {
      onDifficultiesChange([
        ...selectedDifficulties,
        difficulty,
      ]);
    }
  };

  const difficultyStyles = {
    easy: {
      selected:
        "border-emerald-300 bg-emerald-50 text-emerald-700",
      icon:
        "bg-emerald-100 text-emerald-600",
      dot:
        "bg-emerald-400",
    },

    medium: {
      selected:
        "border-amber-300 bg-amber-50 text-amber-700",
      icon:
        "bg-amber-100 text-amber-600",
      dot:
        "bg-amber-400",
    },

    hard: {
      selected:
        "border-rose-300 bg-rose-50 text-rose-700",
      icon:
        "bg-rose-100 text-rose-600",
      dot:
        "bg-rose-400",
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">

        {/* CLOSE */}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close planner setup"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* HEADER */}

        <div className="border-b border-slate-200 bg-slate-50/70 px-7 py-7 sm:px-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-600">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                Weekly Planner
              </p>

              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                Build a focused practice week
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            Build your week
          </h2>

          <p className="mt-2 max-w-xl text-base font-medium leading-6 text-slate-600">
            Tell Dykstra what you want to
            practice and we'll organize the
            first draft for you.
          </p>
        </div>

        {/* CONTENT */}

        <div className="space-y-8 px-7 py-7 sm:px-8">

          {/* TOPICS */}

          <section>
            <div className="mb-4 flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Target className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  What do you want to practice?
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-600">
                  Select one or more topics.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {TOPICS.map((topic) => {
                const selected =
                  selectedTopics.includes(
                    topic,
                  );

                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() =>
                      toggleTopic(
                        topic,
                      )
                    }
                    className={[
                      "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition",
                      selected
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {selected && (
                      <Check className="h-3.5 w-3.5" />
                    )}

                    {topic}
                  </button>
                );
              })}
            </div>
          </section>

          {/* DIFFICULTY */}

          <section>
            <div className="mb-4 flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600">
                <Sparkles className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Difficulty
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-600">
                  Choose the levels you want
                  in your weekly mix.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map(
                (difficulty) => {
                  const selected =
                    selectedDifficulties.includes(
                      difficulty,
                    );

                  const style =
                    difficultyStyles[
                      difficulty
                    ];

                  return (
                    <button
                      key={difficulty}
                      type="button"
                      onClick={() =>
                        toggleDifficulty(
                          difficulty,
                        )
                      }
                      className={[
                        "relative flex min-h-[76px] items-center gap-3 rounded-2xl border px-4 text-left transition",
                        selected
                          ? style.selected
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                          selected
                            ? style.icon
                            : "bg-slate-100 text-slate-400",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "h-2.5 w-2.5 rounded-full",
                            selected
                              ? style.dot
                              : "bg-slate-300",
                          ].join(" ")}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-bold capitalize">
                          {difficulty}
                        </p>

                        <p
                          className={[
                            "mt-0.5 text-[11px] font-semibold",
                            selected
                              ? "opacity-75"
                              : "text-slate-500",
                          ].join(" ")}
                        >
                          {difficulty ===
                          "easy"
                            ? "Warm up"
                            : difficulty ===
                                "medium"
                              ? "Core practice"
                              : "Challenge"}
                        </p>
                      </div>

                      {selected && (
                        <Check className="absolute right-3 top-3 h-4 w-4" />
                      )}
                    </button>
                  );
                },
              )}
            </div>
          </section>

          {/* GOAL */}

          <section>
            <div className="mb-4 flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <Target className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Weekly goal
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-600">
                  How many problems should
                  Dykstra put on your board?
                </p>
              </div>
            </div>

            <div className="flex w-fit items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() =>
                  onGoalCountChange(
                    Math.max(
                      1,
                      goalCount - 1,
                    ),
                  )
                }
                className="grid h-12 w-12 place-items-center text-slate-600 transition hover:bg-slate-200 hover:text-slate-950"
                aria-label="Decrease weekly goal"
              >
                <Minus className="h-4 w-4" />
              </button>

              <div className="flex h-12 w-16 items-center justify-center border-x border-slate-200 bg-white">
                <span className="text-xl font-bold text-slate-950">
                  {goalCount}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  onGoalCountChange(
                    Math.min(
                      30,
                      goalCount + 1,
                    ),
                  )
                }
                className="grid h-12 w-12 place-items-center text-slate-600 transition hover:bg-slate-200 hover:text-slate-950"
                aria-label="Increase weekly goal"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* ACTION */}

          <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
            <p className="hidden text-sm font-semibold text-slate-500 sm:block">
              Dykstra will build your first
              weekly draft.
            </p>

            <Button
              disabled={
                loading ||
                selectedTopics.length ===
                  0 ||
                selectedDifficulties.length ===
                  0
              }
              onClick={onBuild}
              className="h-11 gap-2 rounded-xl bg-slate-950 px-6 text-sm font-bold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />

              {loading
                ? "Building..."
                : "Build my week"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}