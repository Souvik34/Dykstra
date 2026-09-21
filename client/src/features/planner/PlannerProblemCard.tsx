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

  const difficultyClass =
    difficulty === "easy"
      ? "text-emerald-500"
      : difficulty === "medium"
        ? "text-amber-500"
        : difficulty === "hard"
          ? "text-red-500"
          : "text-muted-foreground";

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
        "group relative rounded-xl border",
        "border-border bg-card",
        "p-3 transition-all duration-200",
        "hover:-translate-y-[1px]",
        "hover:border-primary/20",
        "hover:shadow-sm",
        "active:cursor-grabbing",
        item.solved
          ? "opacity-70"
          : "",
      ].join(" ")}
    >
      <div className="flex gap-2">
        <div className="pt-0.5">
          <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground/30 transition group-hover:text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div
              className={[
                "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                item.solved
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                  : "border-border bg-muted/50",
              ].join(" ")}
            >
              {item.solved && (
                <span className="text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                onOpen?.(item)
              }
              className={[
                "min-w-0 flex-1 text-left text-sm font-medium leading-snug transition",
                item.solved
                  ? "text-muted-foreground line-through"
                  : "text-foreground hover:text-primary",
              ].join(" ")}
            >
              {item.title}
            </button>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() =>
                  setMenuOpen(
                    (value) => !value,
                  )
                }
                className="rounded-md p-1 text-muted-foreground/50 opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
                aria-label="Task actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-7 z-30 w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpen?.(item);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs text-popover-foreground transition hover:bg-muted"
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
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs text-red-500 transition hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove task
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 pl-7">
            <span
              className={`text-[10px] font-semibold uppercase ${difficultyClass}`}
            >
              {item.difficulty}
            </span>

            <span className="text-[10px] text-muted-foreground/30">
              •
            </span>

            <span className="truncate text-[10px] text-muted-foreground">
              {item.topic}
            </span>
          </div>

          {item.source === "MENTOR" && (
            <div className="mt-2 flex items-center gap-1 pl-7 text-[9px] font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              Mentor recommendation
            </div>
          )}

          {item.solved && (
            <div className="mt-2 pl-7 text-[9px] font-medium text-emerald-500">
              Already solved
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}