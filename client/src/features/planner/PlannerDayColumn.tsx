/* eslint-disable prettier/prettier */

import {
  useState,
  type DragEvent,
} from "react";

import {
  CalendarPlus,
  Plus,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import PlannerProblemCard from "./PlannerProblemCard";

import type {
  PlannerItem,
} from "./planner.types";

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
}

export default function PlannerDayColumn({
  date,
  dayName,
  items,
  onDropItem,
  onOpenProblem,
  onAddProblem,
}: PlannerDayColumnProps) {
  const [isDragOver, setIsDragOver] =
    useState(false);

  const today =
    isSameDay(
      date,
      new Date(),
    );

  const past =
    isPastDay(date);

  const dateKey =
    formatDate(date);

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
    /*
    Don't remove highlight while
    moving between children.
    */

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

    const itemId =
      Number(rawId);

    if (!itemId) {
      return;
    }

    onDropItem(
      itemId,
      dateKey,
    );
  };

  return (
    <motion.div
      animate={{
        scale: isDragOver
          ? 1.01
          : 1,
      }}
      transition={{
        duration: 0.15,
      }}
      onDragOver={
        handleDragOver
      }
      onDragLeave={
        handleDragLeave
      }
      onDrop={handleDrop}
      className={[
        "relative flex min-h-[620px] min-w-[220px] flex-1 flex-col border-r border-white/[0.06] transition-colors last:border-r-0",
        past
          ? "bg-white/[0.012]"
          : "bg-[#090909]",
        isDragOver
          ? "bg-primary/[0.07]"
          : "",
      ].join(" ")}
    >

      {/* DROP GLOW */}

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
          "relative z-10 border-b border-white/[0.06] px-4 py-3",
          past
            ? "opacity-50"
            : "",
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
              className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-primary"
            >
              Today
            </motion.span>
          )}
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
                      opacity: 0.45,
                      scale: 1,
                    }
              }
              className="w-full rounded-xl border border-dashed border-white/[0.07] px-3 py-8 text-center"
            >
              <CalendarPlus className="mx-auto mb-2 h-4 w-4 text-muted-foreground/40" />

              <p className="text-[11px] text-muted-foreground/50">
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
                onOpen={() =>
                  onOpenProblem(
                    item,
                  )
                }
              />
            ),
          )
        )}
      </div>

      {/* ADD */}

      <div className="relative z-10 border-t border-white/[0.06] p-2.5">
        <motion.button
          type="button"
          whileHover={{
            backgroundColor:
              "rgba(255,255,255,0.035)",
          }}
          whileTap={{
            scale: 0.97,
          }}
          onClick={() =>
            onAddProblem(
              dateKey,
            )
          }
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-white/[0.07] hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </motion.button>
      </div>
    </motion.div>
  );
}