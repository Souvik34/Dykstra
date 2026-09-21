import { Plus } from "lucide-react";

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

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

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

  const weekday = date.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
    },
  );

  const dayNumber = date.getDate();

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={[
        "flex min-h-[520px] min-w-[220px] flex-1 flex-col rounded-xl border transition",
        past
          ? "border-white/[0.05] bg-white/[0.015]"
          : "border-white/[0.08] bg-[#0b0b0b]",
        today
          ? "ring-1 ring-blue-400/30"
          : "",
      ].join(" ")}
    >
      {/* DAY HEADER */}
      <div
        className={[
          "border-b border-white/[0.06] px-4 py-3",
          past
            ? "opacity-50"
            : "",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={[
                "text-xs font-medium uppercase tracking-wider",
                today
                  ? "text-blue-300"
                  : "text-slate-500",
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
                {dayNumber}
              </span>

              <span className="text-xs text-slate-600">
                {formatMonth(date)}
              </span>
            </div>
          </div>

          {today && (
            <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-300">
              Today
            </span>
          )}
        </div>
      </div>

      {/* PROBLEMS */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {sortedItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-white/[0.05]">
            <p className="text-xs text-slate-700">
              No problems planned
            </p>
          </div>
        ) : (
          sortedItems.map(
            (item) => (
              <PlannerProblemCard
                key={item.id}
                item={item}
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

      {/* ADD PROBLEM */}
      <div className="border-t border-white/[0.06] p-3">
        <button
          type="button"
          onClick={() =>
            onAddProblem(dateKey)
          }
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-white/[0.07] hover:bg-white/[0.03] hover:text-slate-300"
        >
          <Plus className="h-3.5 w-3.5" />
          Add problem
        </button>
      </div>
    </div>
  );
}