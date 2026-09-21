/* eslint-disable prettier/prettier */

import { motion } from "framer-motion";
import type { PlannerItem } from "./planner.types";

import PlannerDayColumn from "./PlannerDayColumn";

import {
  WEEK_DAYS,
  addDays,
  getMonday,
  formatDate,
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
  const monday = getMonday(weekStart);

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.99,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#070707] shadow-[0_30px_100px_-50px_rgba(0,0,0,0.95)]"
    >
      <div className="flex min-w-[1470px]">
        {WEEK_DAYS.map((_, index) => {
          const date = addDays(
            monday,
            index,
          );

          const dateString =
            formatDate(date);

          const dayItems = items.filter(
            (item) =>
              item.planned_date.slice(
                0,
                10,
              ) === dateString,
          );

          return (
            <PlannerDayColumn
              key={dateString}
              date={date}
              items={dayItems}
              onDropItem={onMoveItem}
              onOpenProblem={
                onOpenProblem
              }
              onAddProblem={
                onAddProblem
              }
            />
          );
        })}
      </div>
    </motion.div>
  );
}