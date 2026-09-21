import api from "@/lib/api";

import type {
  PlannerDraft,
  PlannerDraftRequest,
  PlannerItem,
  PlannerPlan,
  PlannerProgress,
  SavePlannerRequest,
} from "./planner.types";

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
  const response = await api.post("/planner/draft", payload);

  return response.data.data;
};

export const savePlanner = async (
  payload: SavePlannerRequest,
): Promise<PlannerPlan> => {
  const response = await api.post("/planner", payload);

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