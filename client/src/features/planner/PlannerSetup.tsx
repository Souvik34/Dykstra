/* eslint-disable prettier/prettier */

import {
  Minus,
  Plus,
  Sparkles,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        {/* CLOSE */}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* HEADER */}

        <div className="border-b border-border p-6">
          <div className="mb-2 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Weekly Planner
            </span>
          </div>

          <h2 className="text-xl font-semibold text-foreground">
            Build your week
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Tell Dykstra what you want to
            practice. We'll build the first
            draft for you.
          </p>
        </div>

        {/* CONTENT */}

        <div className="space-y-7 p-6">
          {/* TOPICS */}

          <section>
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                What do you want to practice?
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Select one or more topics.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
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
                      "rounded-lg border px-3 py-2 text-xs font-medium transition",
                      selected
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/20 hover:bg-muted hover:text-foreground",
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
              <h3 className="text-sm font-semibold text-foreground">
                Difficulty
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Dykstra will balance the selected
                levels.
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
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
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
              <h3 className="text-sm font-semibold text-foreground">
                Weekly goal
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                How many problems do you want
                on your board?
              </p>
            </div>

            <div className="flex w-fit items-center rounded-xl border border-border bg-background">
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
                className="grid h-11 w-11 place-items-center text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Minus className="h-4 w-4" />
              </button>

              <div className="w-14 text-center text-lg font-semibold text-foreground">
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
                className="grid h-11 w-11 place-items-center text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* ACTION */}

          <div className="flex justify-end border-t border-border pt-5">
            <Button
              disabled={
                loading ||
                selectedTopics.length ===
                  0 ||
                selectedDifficulties.length ===
                  0
              }
              onClick={onBuild}
              className="gap-2 bg-primary px-5 text-primary-foreground shadow-sm hover:bg-primary/90"
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