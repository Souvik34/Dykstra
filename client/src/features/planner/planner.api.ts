import type {
  PlannerDraft,
  PlannerDraftRequest,
  PlannerPlan,
  PlannerProgress,
  SavePlannerRequest,
} from "./planner.types";

const BASE_URL = "/api/v1/planner";

const request = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Planner request failed",
    );
  }

  return data.data;
};

export const getPlanner = async (
  weekStart: string,
): Promise<PlannerPlan | null> => {
  return request<PlannerPlan | null>(
    `${BASE_URL}?weekStart=${weekStart}`,
  );
};

export const generatePlannerDraft = async (
  payload: PlannerDraftRequest,
): Promise<PlannerDraft> => {
  return request<PlannerDraft>(
    `${BASE_URL}/draft`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
};

export const savePlanner = async (
  payload: SavePlannerRequest,
): Promise<PlannerPlan> => {
  return request<PlannerPlan>(
    BASE_URL,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
};

export const updatePlannerItem = async (
  itemId: number,
  payload: {
    plannedDate: string;
    position: number;
  },
) => {
  return request(
    `${BASE_URL}/items/${itemId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
};

export const deletePlannerItem = async (
  itemId: number,
) => {
  return request(
    `${BASE_URL}/items/${itemId}`,
    {
      method: "DELETE",
    },
  );
};

export const getPlannerProgress = async (
  planId: number,
): Promise<PlannerProgress> => {
  return request<PlannerProgress>(
    `${BASE_URL}/${planId}/progress`,
  );
};