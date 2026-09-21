/* eslint-disable prettier/prettier */

import { Minus, Plus, Sparkles, X } from "lucide-react";

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

  onTopicsChange: (topics: string[]) => void;

  onDifficultiesChange: (
    difficulties: PlannerDifficulty[],
  ) => void;

  onGoalCountChange: (count: number) => void;

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
  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
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
          (item) => item !== difficulty,
        ),
      );
    } else {
      onDifficultiesChange([
        ...selectedDifficulties,
        difficulty,
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0b0b0b] shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9)]">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="border-b border-white/[0.06] p-6">
          <div className="mb-2 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10 text-blue-300">
              <Sparkles className="h-4 w-4" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
              Weekly Planner
            </span>
          </div>

          <h2 className="text-xl font-semibold text-white">
            Build your week
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tell Dykstra what you want to practice.
            We'll build the first draft for you.
          </p>
        </div>

        <div className="space-y-7 p-6">
          {/* TOPICS */}

          <section>
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-200">
                What do you want to practice?
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Select one or more topics.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic) => {
                const selected =
                  selectedTopics.includes(topic);

                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() =>
                      toggleTopic(topic)
                    }
                    className={[
                      "rounded-lg border px-3 py-2 text-xs font-medium transition",
                      selected
                        ? "border-blue-400/30 bg-blue-500/10 text-blue-300 shadow-[0_0_20px_-12px_rgba(59,130,246,0.9)]"
                        : "border-white/[0.07] bg-white/[0.02] text-slate-400 hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-slate-200",
                    ].join(" ")}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </section>

          {/* DIFFICULTY */}

          <section>
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-200">
                Difficulty
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Dykstra will balance the selected levels.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map(
                (difficulty) => {
                  const selected =
                    selectedDifficulties.includes(
                      difficulty,
                    );

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
                        "rounded-xl border px-4 py-3 text-sm font-medium capitalize transition",
                        selected
                          ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
                          : "border-white/[0.07] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
                      ].join(" ")}
                    >
                      {difficulty}
                    </button>
                  );
                },
              )}
            </div>
          </section>

          {/* GOAL */}

          <section>
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-200">
                Weekly goal
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                How many new problems do you want
                on your board?
              </p>
            </div>

            <div className="flex w-fit items-center rounded-xl border border-white/[0.08] bg-white/[0.025]">
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
                className="grid h-11 w-11 place-items-center text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                <Minus className="h-4 w-4" />
              </button>

              <div className="w-14 text-center text-lg font-semibold text-white">
                {goalCount}
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
                className="grid h-11 w-11 place-items-center text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* ACTION */}

          <div className="flex justify-end border-t border-white/[0.06] pt-5">
            <Button
              disabled={
                loading ||
                selectedTopics.length === 0 ||
                selectedDifficulties.length === 0
              }
              onClick={onBuild}
              className="gap-2 bg-blue-500 px-5 text-white shadow-[0_0_30px_-12px_rgba(59,130,246,0.9)] hover:bg-blue-400"
            >
              <Sparkles className="h-4 w-4" />

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