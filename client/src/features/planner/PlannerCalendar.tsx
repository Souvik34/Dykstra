/* eslint-disable prettier/prettier */

import { useMemo } from "react";

import type { PlannerItem } from "./planner.types";

import {
  addDays,
  formatDate,
  getMonday,
} from "./planner.utils";

interface PlannerCalendarProps {
  weekStart: Date;
  items: PlannerItem[];

  onOpenProblem: (
    item: PlannerItem,
  ) => void;
}

export default function PlannerCalendar({
  weekStart,
  items,
  onOpenProblem,
}: PlannerCalendarProps) {
  const calendarDays = useMemo(() => {
    const monday = getMonday(
      weekStart,
    );

    return Array.from(
      { length: 28 },
      (_, index) =>
        addDays(monday, index),
    );
  }, [weekStart]);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#080808] p-3">
      <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-white/[0.06]">
        {calendarDays.map((date) => {
          const dateString =
            formatDate(date);

          const dayItems =
            items.filter(
              (item) =>
                item.planned_date.slice(
                  0,
                  10,
                ) === dateString,
            );

          const today =
            new Date();

          const isToday =
            date.toDateString() ===
            today.toDateString();

          return (
            <div
              key={dateString}
              className={[
                "min-h-[130px] border-b border-r border-white/[0.05] p-2",
                isToday
                  ? "bg-blue-500/[0.035]"
                  : "",
              ].join(" ")}
            >
              <div
                className={[
                  "mb-2 text-xs font-semibold",
                  isToday
                    ? "text-blue-300"
                    : "text-slate-500",
                ].join(" ")}
              >
                {date.getDate()}
              </div>

              <div className="space-y-1">
                {dayItems.map(
                  (item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        onOpenProblem(
                          item,
                        )
                      }
                      className={[
                        "w-full truncate rounded-md border px-2 py-1.5 text-left text-[10px]",
                        "border-white/[0.06] bg-white/[0.025]",
                        "transition hover:bg-white/[0.06]",
                        item.solved
                          ? "text-slate-600 line-through"
                          : "text-slate-300",
                      ].join(" ")}
                    >
                      {item.title}
                    </button>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}