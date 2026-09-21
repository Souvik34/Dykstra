import api from "@/lib/api";

import type {
  PlannerDifficulty,
  PlannerDraft,
  PlannerDraftRequest,
  PlannerItem,
  PlannerItemSource,
  PlannerPlan,
  PlannerProgress,
  PlannerSuggestion,
  SavePlannerRequest,
} from "./planner.types";

const getWeekEnd = (weekStart: string) => {
  const date = new Date(`${weekStart}T00:00:00`);
  date.setDate(date.getDate() + 6);

  return date.toISOString().slice(0, 10);
};

export const getPlanner = async (
  weekStart: string,
): Promise<PlannerPlan | null> => {
  const response = await api.get("/planner", {
    params: { weekStart },
  });

  return response.data.data;
};

export const generatePlannerDraft = async (
  payload: PlannerDraftRequest,
): Promise<PlannerDraft> => {
  const response = await api.post(
    "/planner/draft",
    payload,
  );

  return response.data.data;
};

export const savePlanner = async (
  payload: SavePlannerRequest,
): Promise<PlannerPlan> => {
  const normalizedPayload = {
    ...payload,
    weekEnd:
      payload.weekEnd ||
      getWeekEnd(payload.weekStart),
    items: Array.isArray(payload.items)
      ? payload.items
      : [],
  };

  const response = await api.post(
    "/planner",
    normalizedPayload,
  );

  return response.data.data;
};

export const updatePlannerItem = async (
  itemId: number,
  payload: {
    plannedDate: string;
    position: number;
  },
): Promise<PlannerItem> => {
  const response = await api.put(
    `/planner/items/${itemId}`,
    payload,
  );

  return response.data.data;
};

export const deletePlannerItem = async (
  itemId: number,
) => {
  const response = await api.delete(
    `/planner/items/${itemId}`,
  );

  return response.data;
};

export const getPlannerProgress = async (
  planId: number,
): Promise<PlannerProgress> => {
  const response = await api.get(
    `/planner/${planId}/progress`,
  );

  return response.data.data;
};
export const getPlannerSuggestions = async (
  topic: string,
  difficulty?: PlannerDifficulty[],
): Promise<PlannerSuggestion[]> => {
  const response = await api.get("/planner/suggestions", {
    params: {
      topic,
      difficulties: difficulty?.join(","),
    },
  });

  return response.data.data;
};

export const addPlannerItem = async (payload: {
  weekStart: string;
  problemId: number;
  plannedDate: string;
  position: number;
  source?: PlannerItemSource;
}) => {
  const response = await api.post("/planner/items", payload);
  return response.data.data;
};
export const getPlannerLeaves = async (weekStart: string) => {
  const response = await api.get("/planner/leaves", {
    params: { weekStart },
  });

  return response.data;
};

export const setPlannerLeave = async ({
  weekStart,
  leaveDate,
}: {
  weekStart: string;
  leaveDate: string;
}) => {
  const response = await api.post("/planner/leaves", {
    weekStart,
    leaveDate,
  });

  return response.data;
};

export const removePlannerLeave = async ({
  weekStart,
  leaveDate,
}: {
  weekStart: string;
  leaveDate: string;
}) => {
  const response = await api.delete("/planner/leaves", {
    data: {
      weekStart,
      leaveDate,
    },
  });

  return response.data;
};