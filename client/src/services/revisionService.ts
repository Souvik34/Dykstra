/* eslint-disable prettier/prettier */

import { api } from "@/lib/api";

export interface RevisionItem {
  id: number;
  problem_id: number;

  revision_count: number;
  next_revision_date: string;
  is_completed: boolean;

  user_id: string;

  felt_difficulty?: string;
  confidence_rating?: number;
  time_taken_minutes?: number;

  title: string;
  topic?: string;

  question_link?: string;

  priorityLabel?: string;
  priorityScore?: number;
}

export interface DueRevisionResponse {
  success: boolean;
  blocked: boolean;
  revisions: RevisionItem[];
}

export interface AllRevisionResponse {
  success: boolean;
  revisions: RevisionItem[];
}

const revisionService = {
  async getDueRevisions(): Promise<DueRevisionResponse> {
    const res = await api.get("/revision/due");

    return res.data;
  },

  async completeRevision(
    problemId: number | string,
    timeTaken: number = 0
  ) {
    const res = await api.post(
      `/revision/complete/${problemId}`,
      {
        timeTaken,
      }
    );

    return res.data;
  },

  async getAllRevisions(): Promise<AllRevisionResponse> {
    const res = await api.get("/revision/all");

    return res.data;
  },

  async addRevision(problemId: number | string) {
    const res = await api.post(`/revision/${problemId}`);

    return res.data;
  },
};

export default revisionService;