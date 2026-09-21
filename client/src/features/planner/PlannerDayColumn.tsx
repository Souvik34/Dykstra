/* eslint-disable prettier/prettier */

import { useState } from "react";
import {
  Plus,
  MousePointer2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
}

export default function PlannerDayColumn({
  date,
  items,
  onDropItem,
  onOpenProblem,
  onAddProblem,
}: PlannerDayColumnProps) {
  const [isDragOver, setIsDragOver] =
    useState(false);

  const today = isSameDay(
    date,
    new Date(),
  );

  const past = isPastDay(date);

  const dateKey = formatDate(date);

  const sortedItems = [...items].sort(
    (a, b) =>
      a.position - b.position,
  );

  const weekday =
    date.toLocaleDateString(
      "en-US",
      {
        weekday: "short",
      },
    );

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      "move";

    setIsDragOver(true);
  };

  const handleDragLeave = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    if (
      event.currentTarget ===
      event.target
    ) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    setIsDragOver(false);

    const itemId = Number(
      event.dataTransfer.getData(
        "planner-item-id",
      ),
    );

    if (!itemId) return;

    onDropItem(
      itemId,
      dateKey,
    );
  };

  return (
    <motion.div
      layout
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      animate={{
        backgroundColor: isDragOver
          ? "rgba(59,130,246,0.055)"
          : today
            ? "rgba(59,130,246,0.018)"
            : "rgba(255,255,255,0.0)",
      }}
      transition={{
        duration: 0.18,
      }}
      className={[
        "relative flex min-h-[570px] min-w-[210px]",
        "flex-1 flex-col border-r",
        "border-white/[0.06]",
        "last:border-r-0",
      ].join(" ")}
    >
      {/* DRAG GLOW */}

      <AnimatePresence>
        {isDragOver && (
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
            className="pointer-events-none absolute inset-2 rounded-xl border border-blue-400/30 bg-blue-500/[0.025] shadow-[inset_0_0_30px_rgba(59,130,246,0.04)]"
          />
        )}
      </AnimatePresence>

      {/* HEADER */}

      <div
        className={[
          "relative z-10 border-b border-white/[0.06]",
          "px-4 py-3",
          "bg-[#090909]/90 backdrop-blur-xl",
          past ? "opacity-50" : "",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={[
                "text-[10px] font-semibold uppercase tracking-[0.14em]",
                today
                  ? "text-blue-400"
                  : "text-slate-600",
              ].join(" ")}
            >
              {weekday}
            </p>

            <div className="mt-1 flex items-baseline gap-1.5">
              <span
                className={[
                  "text-xl font-semibold",
                  today
                    ? "text-blue-300"
                    : "text-slate-200",
                ].join(" ")}
              >
                {date.getDate()}
              </span>

              <span className="text-xs text-slate-600">
                {formatMonth(date)}
              </span>
            </div>
          </div>

          {today && (
            <motion.span
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="rounded-full border border-blue-400/15 bg-blue-500/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-blue-300"
            >
              Today
            </motion.span>
          )}
        </div>
      </div>

      {/* TASK AREA */}

      <div className="relative z-10 flex flex-1 flex-col gap-2 p-3">
        <AnimatePresence initial={false}>
          {sortedItems.map((item) => (
            <PlannerProblemCard
              key={item.id}
              item={item}
              onOpen={() =>
                onOpenProblem(item)
              }
            />
          ))}
        </AnimatePresence>

        {/* DROP STATE */}

        {sortedItems.length === 0 &&
          !isDragOver && (
            <div className="flex min-h-[150px] flex-1 items-center justify-center">
              <div className="text-center">
                <MousePointer2 className="mx-auto mb-2 h-4 w-4 text-slate-800" />

                <p className="text-[10px] uppercase tracking-wider text-slate-700">
                  Empty
                </p>
              </div>
            </div>
          )}

        {isDragOver && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-blue-400/30 bg-blue-500/[0.035]"
          >
            <div className="text-center">
              <MousePointer2 className="mx-auto mb-2 h-5 w-5 text-blue-400" />

              <p className="text-xs font-medium text-blue-300">
                Drop here
              </p>

              <p className="mt-1 text-[10px] text-blue-400/50">
                Move task to {weekday}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ADD */}

      <button
        type="button"
        onClick={() =>
          onAddProblem(dateKey)
        }
        className="relative z-10 mx-3 mb-3 flex items-center justify-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-white/[0.07] hover:bg-white/[0.025] hover:text-slate-300"
      >
        <Plus className="h-3.5 w-3.5" />
        Add task
      </button>
    </motion.div>
  );
}