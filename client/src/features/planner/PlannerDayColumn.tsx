/* eslint-disable prettier/prettier */

import {
  CalendarPlus,
  MoreHorizontal,
  Plus,
  RotateCcw,
} from "lucide-react";

import {
  useState,
  type DragEvent,
} from "react";

import { motion } from "framer-motion";

import PlannerProblemCard from "./PlannerProblemCard";

import type { PlannerItem } from "./planner.types";

import {
  formatDate,
  formatMonth,
  isPastDay,
  isSameDay,
} from "./planner.utils";

interface PlannerDayColumnProps {
  date: Date;
  dayName: string;
  items: PlannerItem[];

  onDropItem: (
    itemId: number,
    plannedDate: string,
  ) => void;

  onOpenProblem: (
    item: PlannerItem,
  ) => void;

  onAddProblem: (
    date: string,
  ) => void;

  onDeleteProblem: (
    item: PlannerItem,
  ) => void;

  onResetDay: (
    date: string,
  ) => void;
}

export default function PlannerDayColumn({
  date,
  dayName,
  items,
  onDropItem,
  onOpenProblem,
  onAddProblem,
  onDeleteProblem,
  onResetDay,
}: PlannerDayColumnProps) {
  const [isDragOver, setIsDragOver] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const today = isSameDay(
    date,
    new Date(),
  );

  const past = isPastDay(date);

  const dateKey = formatDate(date);

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      "move";

    setIsDragOver(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    if (
      event.currentTarget.contains(
        event.relatedTarget as Node,
      )
    ) {
      return;
    }

    setIsDragOver(false);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    setIsDragOver(false);

    const rawId =
      event.dataTransfer.getData(
        "planner-item-id",
      );

    const itemId = Number(rawId);

    if (!itemId) return;

    onDropItem(itemId, dateKey);
  };

  return (
    <motion.div
      animate={{
        scale: isDragOver ? 1.01 : 1,
      }}
      transition={{
        duration: 0.15,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        "relative flex min-h-[620px] min-w-[220px] flex-1 flex-col border-r border-border transition-colors last:border-r-0",
        past
          ? "bg-muted/20"
          : "bg-background/70",
        isDragOver
          ? "bg-primary/[0.06]"
          : "",
      ].join(" ")}
    >
      {isDragOver && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="pointer-events-none absolute inset-1 rounded-xl border border-primary/30 bg-primary/[0.025]"
        />
      )}

      {/* HEADER */}

      <div
        className={[
          "relative z-10 border-b border-border px-4 py-3",
          past ? "opacity-50" : "",
        ].join(" ")}
      >
        <div className="flex items-start justify-between">
          <div>
            <p
              className={[
                "text-[11px] font-semibold uppercase tracking-[0.14em]",
                today
                  ? "text-primary"
                  : "text-muted-foreground",
              ].join(" ")}
            >
              {dayName}
            </p>

            <div className="mt-1 flex items-baseline gap-1.5">
              <span
                className={[
                  "text-xl font-semibold",
                  today
                    ? "text-primary"
                    : "text-foreground",
                ].join(" ")}
              >
                {date.getDate()}
              </span>

              <span className="text-xs text-muted-foreground/60">
                {formatMonth(date)}
              </span>
            </div>
          </div>

          <div className="relative flex items-center gap-1">
            {today && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-primary">
                Today
              </span>
            )}

            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  (value) => !value,
                )
              }
              className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Day actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-40 w-36 rounded-lg border border-border bg-popover p-1 shadow-xl">
                <button
                  type="button"
                  disabled={
                    items.length === 0
                  }
                  onClick={() => {
                    setMenuOpen(false);
                    onResetDay(dateKey);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs text-popover-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset day
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TASK AREA */}

      <div className="relative z-10 flex flex-1 flex-col gap-2.5 p-3">
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <motion.div
              animate={
                isDragOver
                  ? {
                      opacity: 1,
                      scale: 1.02,
                    }
                  : {
                      opacity: 0.55,
                      scale: 1,
                    }
              }
              className="w-full rounded-xl border border-dashed border-border px-3 py-8 text-center"
            >
              <CalendarPlus className="mx-auto mb-2 h-4 w-4 text-muted-foreground/40" />

              <p className="text-[11px] text-muted-foreground/60">
                {isDragOver
                  ? "Drop here"
                  : "No tasks"}
              </p>
            </motion.div>
          </div>
        ) : (
          items.map(
            (item, index) => (
              <PlannerProblemCard
                key={item.id}
                item={item}
                index={index}
                onOpen={onOpenProblem}
                onDelete={
                  onDeleteProblem
                }
              />
            ),
          )
        )}
      </div>

      {/* ADD */}

      <div className="relative z-10 border-t border-border p-2.5">
        <motion.button
          type="button"
          whileTap={{
            scale: 0.97,
          }}
          onClick={() =>
            onAddProblem(dateKey)
          }
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </motion.button>
      </div>
    </motion.div>
  );
}