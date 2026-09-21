/* eslint-disable prettier/prettier */

import { GripVertical, Sparkles } from "lucide-react";

import type { PlannerItem } from "./planner.types";

interface PlannerProblemCardProps {
  item: PlannerItem;
  onOpen?: (item: PlannerItem) => void;
}

export default function PlannerProblemCard({
  item,
  onOpen,
}: PlannerProblemCardProps) {
  const difficulty =
    item.difficulty.toLowerCase();

  const difficultyClass =
    difficulty === "easy"
      ? "text-emerald-400"
      : difficulty === "medium"
        ? "text-amber-400"
        : difficulty === "hard"
          ? "text-red-400"
          : "text-slate-400";

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.dataTransfer.setData(
      "planner-item-id",
      String(item.id),
    );

    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onOpen?.(item)}
      className={[
        "group relative cursor-grab rounded-xl border",
        "border-white/[0.07] bg-white/[0.025]",
        "p-3 transition-all duration-200",
        "hover:-translate-y-[1px]",
        "hover:border-white/[0.14]",
        "hover:bg-white/[0.045]",
        "active:cursor-grabbing",
        item.solved
          ? "opacity-55"
          : "shadow-[0_10px_35px_-25px_rgba(0,0,0,0.9)]",
      ].join(" ")}
    >
      <div className="flex gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-700 transition group-hover:text-slate-500" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div
              className={[
                "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                item.solved
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                  : "border-white/10 bg-white/[0.03]",
              ].join(" ")}
            >
              {item.solved && (
                <span className="text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>

            <div
              className={[
                "min-w-0 text-sm font-medium leading-snug",
                item.solved
                  ? "text-slate-500 line-through"
                  : "text-slate-200",
              ].join(" ")}
            >
              {item.title}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 pl-7">
            <span
              className={`text-[10px] font-semibold uppercase ${difficultyClass}`}
            >
              {item.difficulty}
            </span>

            <span className="text-[10px] text-slate-700">
              •
            </span>

            <span className="truncate text-[10px] text-slate-500">
              {item.topic}
            </span>
          </div>

          {item.source === "MENTOR" && (
            <div className="mt-2 flex items-center gap-1 pl-7 text-[9px] font-semibold text-blue-300">
              <Sparkles className="h-3 w-3" />
              Mentor recommendation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}