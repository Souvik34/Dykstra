/* eslint-disable prettier/prettier */
import { api } from "@/lib/api";
import { BackendProblem, ProblemsResponse } from "../features/problems/problems-data";



type ProgressResponse = {
  progress?: unknown;
  data?: unknown;
};

export const problemService = {
async list(params: {
  page?: number;
  limit?: number;
  ids?: number[];
} = {}): Promise<ProblemsResponse> {
  console.log("PROBLEMS REQUEST PARAMS:", params);

  const queryParams = {
    page: params.page,
    limit: params.limit,
    ...(params.ids?.length
      ? { ids: params.ids.join(",") }
      : {}),
  };

  console.log("PROBLEMS QUERY PARAMS:", queryParams);

  const res = await api.get("/problems", {
    params: queryParams,
  });

  const data = res.data;

  console.log("PROBLEMS RAW RESPONSE:", data);

  // Backend returns an array directly
  if (Array.isArray(data)) {
    return {
      problems: data,
      lastUpdated: null,
    };
  }

  // Backend returns:
  // { problems: [...], lastUpdated: "..." }
  if (Array.isArray(data?.problems)) {
    return {
      problems: data.problems,
      lastUpdated: data.lastUpdated ?? null,
    };
  }

  // Backend returns:
  // { data: [...] }
  if (Array.isArray(data?.data)) {
    return {
      problems: data.data,
      lastUpdated: data.lastUpdated ?? null,
    };
  }

  // Backend returns:
  // { data: { problems: [...], lastUpdated: "..." } }
  if (Array.isArray(data?.data?.problems)) {
    return {
      problems: data.data.problems,
      lastUpdated:
        data.data.lastUpdated ??
        data.lastUpdated ??
        null,
    };
  }

  console.error(
    "UNKNOWN PROBLEMS RESPONSE FORMAT:",
    data,
  );

  return {
    problems: [],
    lastUpdated: null,
  };
},
async getById(id: number | string): Promise<BackendProblem> {
  console.log("GETTING PROBLEM BY ID:", id);

  const res = await api.get(`/problems/${id}`);

  console.log("GET BY ID RESPONSE:", res.data);

  return res.data;
},
async markSolved(
  problemId: number | string,
  difficulty: string,
  timeTaken: number
) {
  const res = await api.post("/problems/solve", {
    problemId,
    difficulty,
    timeTaken,
  });

  return res.data;
},
  async toggleBookmark(id: number | string) {
    const res = await api.post(`/problems/${id}/bookmark`);
    return res.data;
  },
async startProblem(id: number | string) {
  try {
    const res = await api.post(`/problems/${id}/start`);
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 403) {
      return {
        blocked: true,
        problemId: err.response?.data?.problemId,
        message: err.response?.data?.message,
      };
    }

    throw err;
  }
},

  async toggleRevision(id: number | string) {
    const res = await api.post(`/problems/${id}/revision`);
    return res.data;
  },

  async saveNotes(id: number | string, notes: string) {
    const res = await api.put(`/problems/${id}/notes`, { notes });
    return res.data;
  },

  async getProgress() {
    const res = await api.get<ProgressResponse>("/problems/progress");

    const data = res.data;

    return data.progress ?? data.data;
  },

  async submitSolution(id: number | string, payload: unknown) {
    const res = await api.post(`/problems/${id}/submit`, payload);
    return res.data;
  },

  async getNotes() {
  const res = await api.get("/problems/notes");
  return res.data.notes;
},

async getProblemNotes(id: number | string) {
  const res = await api.get(`/problems/${id}/notes`);
  return res.data.notes;
},






async getBookmarks() {
  const res = await api.get("/problems/bookmarks");
  return res.data.bookmarks;
},

async addBookmark(id: number | string) {
  const res = await api.post(`/problems/${id}/bookmark`);
  return res.data;
},

async removeBookmark(id: number | string) {
  const res = await api.delete(`/problems/${id}/bookmark`);
  return res.data;
},
async completeMentorProblem(problemId: number | string) {
  const res = await api.post("/mentor/complete", {
    problemId,
  });

  return res.data;
},
};




export default problemService;
