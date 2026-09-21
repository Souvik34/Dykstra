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
}

export default function PlannerWeekView({
  weekStart,
  items,
  onMoveItem,
  onOpenProblem,
  onAddProblem,
}: PlannerWeekViewProps) {
  const monday =
    getMonday(weekStart);

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
      className="overflow-x-auto rounded-2xl border border-border bg-[#070707] shadow-[0_30px_100px_-50px_rgba(0,0,0,0.95)]"
    >
      <div className="flex min-w-[1540px]">

        {WEEK_DAYS.map(
          (day, index) => {
            const date =
              addDays(
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
                    ).slice(
                      0,
                      10,
                    ) ===
                    dateString,
                )
                .sort(
                  (a, b) =>
                    a.position -
                    b.position,
                );

            return (
              <PlannerDayColumn
                key={dateString}
                date={date}
                dayName={day}
                items={dayItems}
                onDropItem={
                  onMoveItem
                }
                onOpenProblem={
                  onOpenProblem
                }
                onAddProblem={
                  onAddProblem
                }
              />
            );
          },
        )}
      </div>
    </motion.div>
  );
}