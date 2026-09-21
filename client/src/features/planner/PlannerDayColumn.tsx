/* eslint-disable prettier/prettier */

import {
  CalendarOff,
  CalendarPlus,
  Check,
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

  isLeave?: boolean;

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

  onSetLeave?: (
    date: string,
  ) => void;

  onRemoveLeave?: (
    date: string,
  ) => void;
}

export default function PlannerDayColumn({
  date,
  dayName,
  items,
  isLeave = false,
  onDropItem,
  onOpenProblem,
  onAddProblem,
  onDeleteProblem,
  onResetDay,
  onSetLeave,
  onRemoveLeave,
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

  const locked = past || isLeave;

  const dateKey = formatDate(date);

  /*
   * Each day gets its own subtle header tone.
   * The colors are intentionally soft so the
   * board still feels like one product.
   */
  const headerStyles = [
    {
      bar: "bg-sky-400",
      soft: "bg-sky-50",
      text: "text-sky-700",
    },
    {
      bar: "bg-violet-400",
      soft: "bg-violet-50",
      text: "text-violet-700",
    },
    {
      bar: "bg-amber-400",
      soft: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      bar: "bg-emerald-400",
      soft: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      bar: "bg-rose-400",
      soft: "bg-rose-50",
      text: "text-rose-700",
    },
    {
      bar: "bg-indigo-400",
      soft: "bg-indigo-50",
      text: "text-indigo-700",
    },
    {
      bar: "bg-cyan-400",
      soft: "bg-cyan-50",
      text: "text-cyan-700",
    },
  ];

  const header =
    headerStyles[
      date.getDay() === 0
        ? 6
        : date.getDay() - 1
    ];

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    if (locked) return;

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

    if (locked) return;

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
        "relative flex min-h-[620px] min-w-[220px] flex-1 flex-col",
        "border-r border-slate-200/70",
        "transition-colors last:border-r-0",
        past
          ? "bg-slate-100/70"
          : isLeave
            ? "bg-slate-50"
            : "bg-white",
        isDragOver
          ? "bg-primary/[0.06]"
          : "",
      ].join(" ")}
    >
      {isDragOver && !locked && (
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
          "relative z-10 overflow-hidden border-b border-slate-200/80",
          past
            ? "opacity-50"
            : "",
        ].join(" ")}
      >
        {/* Colored horizontal day bar */}

        <div
          className={[
            "h-1 w-full",
            header.bar,
          ].join(" ")}
        />

        <div className="px-4 py-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p
                  className={[
                    "text-[11px] font-bold uppercase tracking-[0.14em]",
                    today
                      ? header.text
                      : "text-slate-500",
                  ].join(" ")}
                >
                  {dayName}
                </p>

                {isLeave && (
                  <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-slate-500">
                    Leave
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-baseline gap-1.5">
                <span
                  className={[
                    "text-xl font-semibold",
                    today
                      ? header.text
                      : "text-slate-800",
                  ].join(" ")}
                >
                  {date.getDate()}
                </span>

                <span className="text-xs text-slate-400">
                  {formatMonth(date)}
                </span>
              </div>
            </div>

            <div className="relative flex items-center gap-1">
              {today && !isLeave && (
                <span
                  className={[
                    "rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider",
                    header.soft,
                    header.text,
                  ].join(" ")}
                >
                  Today
                </span>
              )}

              {isLeave && (
                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  <CalendarOff className="h-3 w-3" />
                  Off
                </span>
              )}

              <button
                type="button"
                disabled={past}
                onClick={() =>
                  setMenuOpen(
                    (value) => !value,
                  )
                }
                className={[
                  "rounded-md p-1.5 transition",
                  "text-slate-400",
                  "hover:bg-slate-100 hover:text-slate-700",
                  "disabled:cursor-not-allowed disabled:opacity-30",
                ].join(" ")}
                aria-label="Day actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {menuOpen && !past && (
                <div className="absolute right-0 top-8 z-40 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                  <button
                    type="button"
                    disabled={
                      isLeave ||
                      items.length === 0
                    }
                    onClick={() => {
                      setMenuOpen(false);
                      onResetDay(dateKey);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset day
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  {!isLeave ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onSetLeave?.(
                          dateKey,
                        );
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-700 transition hover:bg-slate-50"
                    >
                      <CalendarOff className="h-3.5 w-3.5" />
                      Mark as leave
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onRemoveLeave?.(
                          dateKey,
                        );
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-700 transition hover:bg-slate-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Remove leave
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LEAVE STATE */}

      {isLeave ? (
        <div className="relative z-10 flex flex-1 items-center justify-center p-4">
          <div className="w-full rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-10 text-center">
            <div className="mx-auto mb-3 grid h-9 w-9 place-items-center rounded-full bg-slate-100">
              <CalendarOff className="h-4 w-4 text-slate-400" />
            </div>

            <p className="text-xs font-medium text-slate-500">
              Day off
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              No planner tasks
            </p>
          </div>
        </div>
      ) : (
        <>
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
                  className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-3 py-8 text-center"
                >
                  <CalendarPlus className="mx-auto mb-2 h-4 w-4 text-slate-300" />

                  <p className="text-[11px] text-slate-400">
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
                    onOpen={
                      onOpenProblem
                    }
                    onDelete={
                      onDeleteProblem
                    }
                  />
                ),
              )
            )}
          </div>

          {/* ADD */}

          <div className="relative z-10 border-t border-slate-200/80 p-2.5">
            <motion.button
              type="button"
              whileTap={{
                scale: 0.97,
              }}
              onClick={() =>
                onAddProblem(dateKey)
              }
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add task
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
}