import type {
  PlannerDifficulty,
  PlannerItem,
} from "./planner.types";

export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const TOPICS = [
  "Arrays",
  "Strings",
  "Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Heap",
  "Graphs",
  "Greedy",
  "Backtracking",
  "Dynamic Programming",
] as const;

export const DIFFICULTIES: PlannerDifficulty[] = [
  "easy",
  "medium",
  "hard",
];

export const pad = (value: number) =>
  String(value).padStart(2, "0");

export const formatDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
  export const formatMonth = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
  });

export const getMonday = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);
  result.setHours(0, 0, 0, 0);

  return result;
};

export const addDays = (
  date: Date,
  amount: number,
) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};

export const isSameDay = (
  first: Date,
  second: Date,
) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export const isPastDay = (date: Date) => {
  const today = new Date();

  const current = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  return target < current;
};

export const formatWeekRange = (
  weekStart: Date,
) => {
  const weekEnd = addDays(weekStart, 6);

  const start = weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const end = weekEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${start} – ${end}`;
};

export const getDifficultyClass = (
  difficulty: string,
) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "text-emerald-400";

    case "medium":
      return "text-amber-400";

    case "hard":
      return "text-red-400";

    default:
      return "text-slate-400";
  }
};

export const groupItemsByDate = (
  items: PlannerItem[],
) => {
  return items.reduce<Record<string, PlannerItem[]>>(
    (groups, item) => {
      const key = item.planned_date.slice(0, 10);

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(item);

      groups[key].sort(
        (a, b) => a.position - b.position,
      );

      return groups;
    },
    {},
  );
};