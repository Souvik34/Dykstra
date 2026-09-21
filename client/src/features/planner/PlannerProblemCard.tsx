/* eslint-disable prettier/prettier */

import {
  ExternalLink,
  GripVertical,
  MoreHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  useState,
  type DragEvent,
} from "react";

import { motion } from "framer-motion";

import type { PlannerItem } from "./planner.types";

interface PlannerProblemCardProps {
  item: PlannerItem;
  index?: number;
  onOpen?: (item: PlannerItem) => void;
  onDelete?: (item: PlannerItem) => void;
}

export default function PlannerProblemCard({
  item,
  index = 0,
  onOpen,
  onDelete,
}: PlannerProblemCardProps) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const difficulty =
    item.difficulty.toLowerCase();

  const difficultyConfig =
    difficulty === "easy"
      ? {
          label: "Easy",
          bar: "bg-emerald-400",
          text: "text-emerald-600",
          soft: "bg-emerald-50",
        }
      : difficulty === "medium"
        ? {
            label: "Medium",
            bar: "bg-amber-400",
            text: "text-amber-600",
            soft: "bg-amber-50",
          }
        : difficulty === "hard"
          ? {
              label: "Hard",
              bar: "bg-rose-400",
              text: "text-rose-600",
              soft: "bg-rose-50",
            }
          : {
              label: item.difficulty,
              bar: "bg-slate-400",
              text: "text-slate-500",
              soft: "bg-slate-50",
            };

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.dataTransfer.setData(
      "planner-item-id",
      String(item.id),
    );

    event.dataTransfer.effectAllowed =
      "move";
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 5,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: Math.min(index * 0.025, 0.15),
        duration: 0.2,
      }}
      draggable
      onDragStart={handleDragStart}
      className={[
        "group relative overflow-hidden rounded-xl",
        "border border-slate-200/80",
        "bg-white",
        "shadow-[0_1px_3px_rgba(15,23,42,0.04)]",
        "transition-all duration-200",
        "hover:-translate-y-[1px]",
        "hover:border-slate-300",
        "hover:shadow-[0_6px_18px_rgba(15,23,42,0.07)]",
        "active:cursor-grabbing",
        item.solved
          ? "opacity-65"
          : "",
      ].join(" ")}
    >
      {/* DIFFICULTY HEADER BAR */}

      <div
        className={[
          "h-1 w-full",
          difficultyConfig.bar,
        ].join(" ")}
      />

      <div className="p-3">
        <div className="flex gap-2">
          {/* DRAG HANDLE */}

          <div className="pt-0.5">
            <GripVertical
              className={[
                "h-4 w-4 cursor-grab",
                "text-slate-300",
                "transition-colors",
                "group-hover:text-slate-400",
              ].join(" ")}
            />
          </div>

          <div className="min-w-0 flex-1">
            {/* TITLE ROW */}

            <div className="flex items-start gap-2">
              {/* SOLVED INDICATOR */}

              <div
                className={[
                  "grid h-5 w-5 shrink-0 place-items-center",
                  "rounded-full border",
                  item.solved
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-slate-50",
                ].join(" ")}
              >
                {item.solved && (
                  <span className="text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>

              {/* TITLE */}

              <button
                type="button"
                onClick={() =>
                  onOpen?.(item)
                }
                className={[
                  "min-w-0 flex-1 text-left",
                  "text-sm font-medium leading-snug",
                  "transition-colors",
                  item.solved
                    ? "text-slate-400 line-through"
                    : "text-slate-800 hover:text-slate-950",
                ].join(" ")}
              >
                {item.title}
              </button>

              {/* MENU */}

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setMenuOpen(
                      (value) => !value,
                    )
                  }
                  className={[
                    "rounded-md p-1",
                    "text-slate-400",
                    "opacity-0 transition",
                    "hover:bg-slate-100",
                    "hover:text-slate-700",
                    "group-hover:opacity-100",
                  ].join(" ")}
                  aria-label="Task actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-7 z-30 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpen?.(item);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs text-slate-700 transition hover:bg-slate-50"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open in Problems
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete?.(item);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs text-rose-500 transition hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove task
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* META */}

            <div className="mt-2 flex items-center gap-2 pl-7">
              <span
                className={[
                  "rounded-md px-1.5 py-0.5",
                  "text-[9px] font-bold uppercase tracking-wide",
                  difficultyConfig.soft,
                  difficultyConfig.text,
                ].join(" ")}
              >
                {difficultyConfig.label}
              </span>

              <span className="text-[10px] text-slate-300">
                •
              </span>

              <span className="truncate text-[10px] text-slate-500">
                {item.topic}
              </span>
            </div>

            {/* MENTOR */}

            {item.source === "MENTOR" && (
              <div className="mt-2.5 flex items-center gap-1 pl-7 text-[9px] font-semibold text-violet-600">
                <Sparkles className="h-3 w-3" />
                Mentor recommendation
              </div>
            )}

            {/* SOLVED */}

            {item.solved && (
              <div className="mt-2 pl-7 text-[9px] font-medium text-emerald-600">
                Already solved
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}