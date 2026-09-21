/* eslint-disable prettier/prettier */

import {
  Check,
  Loader2,
  Search,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import { getPlannerSuggestions } from "./planner.api";

import type {
  PlannerDifficulty,
  PlannerSuggestion,
} from "./planner.types";

import { DIFFICULTIES, TOPICS } from "./planner.utils";

interface PlannerProblemPickerProps {
  date: string;
  onAdd: (
    problem: PlannerSuggestion,
    date: string,
  ) => Promise<void>;
  onClose: () => void;
  existingProblemIds: number[];
}

export default function PlannerProblemPicker({
  date,
  onAdd,
  onClose,
  existingProblemIds,
}: PlannerProblemPickerProps) {
  const [topic, setTopic] = useState(
    TOPICS[0],
  );

  const [difficulty, setDifficulty] =
    useState<PlannerDifficulty[]>([
      "easy",
      "medium",
    ]);

  const [search, setSearch] =
    useState("");

  const [suggestions, setSuggestions] =
    useState<PlannerSuggestion[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [addingId, setAddingId] =
    useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadSuggestions = async () => {
      setLoading(true);

      try {
        const result =
          await getPlannerSuggestions(
            topic,
            difficulty,
          );

        if (!cancelled) {
          setSuggestions(
            Array.isArray(result)
              ? result
              : [],
          );
        }
      } catch (error) {
        console.error(
          "Failed to load planner suggestions:",
          error,
        );

        if (!cancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, [topic, difficulty]);

  const toggleDifficulty = (
    value: PlannerDifficulty,
  ) => {
    setDifficulty((current) =>
      current.includes(value)
        ? current.filter(
            (item) => item !== value,
          )
        : [...current, value],
    );
  };

  const filteredSuggestions =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return suggestions.filter(
        (problem) => {
          if (
            existingProblemIds.includes(
              problem.problem_id,
            )
          ) {
            return false;
          }

          if (!query) return true;

          return (
            problem.title
              .toLowerCase()
              .includes(query) ||
            problem.topic
              .toLowerCase()
              .includes(query)
          );
        },
      );
    }, [
      suggestions,
      search,
      existingProblemIds,
    ]);

  const handleAdd = async (
    problem: PlannerSuggestion,
  ) => {
    setAddingId(problem.problem_id);

    try {
      await onAdd(problem, date);
    } finally {
      setAddingId(null);
    }
  };

  const formattedDate =
    new Date(
      `${date}T00:00:00`,
    ).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "short",
        day: "numeric",
      },
    );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <motion.div
        initial={{
          opacity: 0,
          y: 12,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl"
      >
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              Add to planner
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              {formattedDate}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Choose a problem to place on this
              day.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* FILTERS */}

        <div className="space-y-3 border-b border-border bg-muted/20 p-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search problems..."
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {TOPICS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setTopic(value)
                }
                className={[
                  "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                  topic === value
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {value}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {DIFFICULTIES.map(
              (value) => {
                const selected =
                  difficulty.includes(
                    value,
                  );

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      toggleDifficulty(
                        value,
                      )
                    }
                    className={[
                      "rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition",
                      selected
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground",
                    ].join(" ")}
                  >
                    {value}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* RESULTS */}

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : filteredSuggestions.length ===
            0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-muted">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>

              <p className="text-sm font-medium">
                No problems found
              </p>

              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Try another topic, difficulty,
                or search term.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSuggestions.map(
                (problem) => {
                  const adding =
                    addingId ===
                    problem.problem_id;

                  return (
                    <motion.button
                      key={
                        problem.problem_id
                      }
                      type="button"
                      whileTap={{
                        scale: 0.995,
                      }}
                      disabled={adding}
                      onClick={() =>
                        handleAdd(
                          problem,
                        )
                      }
                      className="group flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition hover:border-primary/30 hover:bg-muted/40"
                    >
                      <div
                        className={[
                          "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                          problem.solved
                            ? "border-emerald-500/20 bg-emerald-500/10"
                            : "border-border bg-muted",
                        ].join(" ")}
                      >
                        {problem.solved ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-primary/70" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {problem.title}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-[10px]">
                          <span className="font-semibold uppercase text-muted-foreground">
                            {problem.difficulty}
                          </span>

                          <span className="text-muted-foreground/40">
                            •
                          </span>

                          <span className="truncate text-muted-foreground">
                            {problem.topic}
                          </span>

                          {problem.solved && (
                            <>
                              <span className="text-muted-foreground/40">
                                •
                              </span>

                              <span className="font-medium text-emerald-500">
                                Solved
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {adding && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                    </motion.button>
                  );
                },
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}