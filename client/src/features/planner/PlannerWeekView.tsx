/* eslint-disable prettier/prettier */

import { motion } from "framer-motion";

import type { PlannerItem } from "./planner.types";

import PlannerDayColumn from "./PlannerDayColumn";

import {
  WEEK_DAYS,
  addDays,
  formatDate,
  getMonday,
} from "./planner.utils";

interface PlannerWeekViewProps {
  weekStart: Date;
  items: PlannerItem[];
  leaves?: string[];

  onMoveItem: (
    itemId: number,
    date: string,
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

export default function PlannerWeekView({
  weekStart,
  items,
  leaves = [],
  onMoveItem,
  onOpenProblem,
  onAddProblem,
  onDeleteProblem,
  onResetDay,
  onSetLeave,
  onRemoveLeave,
}: PlannerWeekViewProps) {
  const monday = getMonday(weekStart);

  const leaveSet = new Set(
    leaves.map((date) =>
      String(date).slice(0, 10),
    ),
  );

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
      }}
      className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-50/70 shadow-sm"
    >
      <div className="flex min-w-[1540px] divide-x divide-slate-200/70">
        {WEEK_DAYS.map(
          (day, index) => {
            const date = addDays(
              monday,
              index,
            );

            const dateString =
              formatDate(date);

            const dayItems =
              items
                .filter(
                  (item) =>
                    String(
                      item.planned_date,
                    ).slice(0, 10) ===
                    dateString,
                )
                .sort(
                  (a, b) =>
                    a.position -
                    b.position,
                );

            const isLeave =
              leaveSet.has(
                dateString,
              );

            return (
              <PlannerDayColumn
                key={dateString}
                date={date}
                dayName={day}
                items={dayItems}
                isLeave={isLeave}
                onDropItem={
                  onMoveItem
                }
                onOpenProblem={
                  onOpenProblem
                }
                onAddProblem={
                  onAddProblem
                }
                onDeleteProblem={
                  onDeleteProblem
                }
                onResetDay={
                  onResetDay
                }
                onSetLeave={
                  onSetLeave
                }
                onRemoveLeave={
                  onRemoveLeave
                }
              />
            );
          },
        )}
      </div>
    </motion.div>
  );
}