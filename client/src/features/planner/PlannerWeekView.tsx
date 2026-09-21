/* eslint-disable prettier/prettier */

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
    <div className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-[#080808] shadow-[0_20px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex min-w-[1470px]">
        {WEEK_DAYS.map((_, index) => {
          const date = addDays(monday, index);

          const dateString = formatDate(date);

          const dayItems = items.filter(
            (item) =>
              item.planned_date.slice(0, 10) ===
              dateString,
          );

          return (
            <PlannerDayColumn
              key={dateString}
              date={date}
              items={dayItems}
              onDropItem={onMoveItem}
              onOpenProblem={onOpenProblem}
              onAddProblem={onAddProblem}
            />
          );
        })}
      </div>
    </div>
  );
}