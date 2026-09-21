import type {
  PlannerDraft,
  PlannerDraftRequest,
  PlannerPlan,
  SavePlannerRequest,
} from "./planner.types";

const BASE_URL = "/api/v1/planner";

const request = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Planner request failed");
  }

  return data;
};

export const getPlanner = async (
  weekStart: string,
): Promise<PlannerPlan | null> => {
  const data = await request<{ success: boolean; data: PlannerPlan | null }>(
    `${BASE_URL}?weekStart=${weekStart}`,
  );

  return data.data;
};

export const generatePlannerDraft = async (
  payload: PlannerDraftRequest,
): Promise<PlannerDraft> => {
  const data = await request<{ success: boolean; data: PlannerDraft }>(
    `${BASE_URL}/draft`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return data.data;
};

export const savePlanner = async (
  payload: SavePlannerRequest,
): Promise<PlannerPlan> => {
  const data = await request<{ success: boolean; data: PlannerPlan }>(
    BASE_URL,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return data.data;
};

export const updatePlannerItem = async (
  itemId: number,
  payload: {
    plannedDate: string;
    position: number;
  },
) => {
  return request(`${BASE_URL}/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deletePlannerItem = async (itemId: number) => {
  return request(`${BASE_URL}/items/${itemId}`, {
    method: "DELETE",
  });
};

export const getPlannerProgress = async (planId: number) => {
  const data = await request<{
    success: boolean;
    data: {
      total: number;
      solved: number;
      remaining: number;
      percentage: number;
    };
  }>(`${BASE_URL}/${planId}/progress`);

  return data.data;
};