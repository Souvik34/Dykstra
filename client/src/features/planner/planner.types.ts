export type PlannerDifficulty = "easy" | "medium" | "hard";

export type PlannerItemSource = "PLANNER" | "MENTOR" | "USER";

export interface PlannerItem {
  id: number;
  problem_id: number;
  planned_date: string;
  position: number;
  source: PlannerItemSource;

  title: string;
  difficulty: string;
  topic: string;
  tags?: string | null;
  platform?: string;
  question_link?: string;

  solved: boolean;
}

export interface PlannerPlan {
  id: number;
  user_id: string;
  week_start: string;
  week_end: string;
  goal_count: number;
  created_at: string;
  updated_at: string;
  items: PlannerItem[];
}

export interface PlannerDraftRequest {
  weekStart: string;
  topics: string[];
  difficulties: PlannerDifficulty[];
  goalCount: number;
  mentorProblemIds?: number[];
}

export interface PlannerDraft {
  weekStart: string;
  weekEnd: string;
  goalCount: number;
  items: PlannerItem[];
}

export interface PlannerSaveItem {
  problemId: number;
  plannedDate: string;
  position: number;
  source?: PlannerItemSource;
}

export interface SavePlannerRequest {
  weekStart: string;
  weekEnd: string;
  goalCount: number;
  items: PlannerSaveItem[];
}

export interface PlannerProgress {
  total: number;
  solved: number;
  remaining: number;
  percentage: number;
}