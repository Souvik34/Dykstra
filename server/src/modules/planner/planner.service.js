import * as plannerRepository from "./planner.repository.js";

/*
|--------------------------------------------------------------------------
| Date helpers
|--------------------------------------------------------------------------
*/

const pad = (value) =>
  String(value).padStart(2, "0");

const formatDate = (date) => {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
};

const getMonday = (date = new Date()) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  const day = result.getDay();

  const diff =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() + diff,
  );

  return result;
};

const addDays = (date, days) => {
  const result = new Date(date);

  result.setDate(
    result.getDate() + days,
  );

  return result;
};

/*
|--------------------------------------------------------------------------
| Difficulty normalization
|--------------------------------------------------------------------------
*/

const normalizeDifficulty = (difficulty) => {
  if (!difficulty) {
    return "";
  }

  return String(difficulty)
    .trim()
    .toLowerCase();
};

/*
|--------------------------------------------------------------------------
| Candidate scoring
|--------------------------------------------------------------------------
*/

const scoreProblem = (
  problem,
  {
    mentorProblemIds,
    selectedTopics,
  },
) => {
  let score = 0;

  const problemId = Number(problem.id);

  if (mentorProblemIds.has(problemId)) {
    score += 1000;
  }

  if (
    selectedTopics.some(
      (topic) =>
        String(topic).trim().toLowerCase() ===
        String(problem.topic)
          .trim()
          .toLowerCase(),
    )
  ) {
    score += 100;
  }

  const difficulty = normalizeDifficulty(
    problem.difficulty,
  );

  if (difficulty === "easy") {
    score += 30;
  }

  if (difficulty === "medium") {
    score += 20;
  }

  if (difficulty === "hard") {
    score += 10;
  }

  // Stable deterministic tie-breaker.
  score +=
    Math.max(
      0,
      10_000 - problemId,
    ) / 100_000;

  return score;
};

/*
|--------------------------------------------------------------------------
| Select problems
|--------------------------------------------------------------------------
*/

const selectProblems = ({
  candidates,
  goalCount,
  selectedTopics,
  mentorProblemIds,
}) => {
  if (
    !candidates ||
    candidates.length === 0
  ) {
    return [];
  }

  const scored = candidates
    .map((problem) => ({
      problem,
      score: scoreProblem(
        problem,
        {
          mentorProblemIds,
          selectedTopics,
        },
      ),
    }))
    .sort(
      (a, b) =>
        b.score - a.score,
    );

  const selected = [];
  const usedIds = new Set();

  const topicBuckets = new Map();

  for (const item of scored) {
    const normalizedTopic =
      String(item.problem.topic)
        .trim()
        .toLowerCase();

    if (
      !topicBuckets.has(
        normalizedTopic,
      )
    ) {
      topicBuckets.set(
        normalizedTopic,
        [],
      );
    }

    topicBuckets
      .get(normalizedTopic)
      .push(item.problem);
  }

  /*
  |--------------------------------------------------------------------------
  | First pass: cover selected topics
  |--------------------------------------------------------------------------
  */

  for (const topic of selectedTopics) {
    const normalizedTopic =
      String(topic)
        .trim()
        .toLowerCase();

    const bucket =
      topicBuckets.get(
        normalizedTopic,
      );

    if (
      !bucket ||
      bucket.length === 0
    ) {
      continue;
    }

    const problem = bucket[0];
    const problemId = Number(problem.id);

    if (usedIds.has(problemId)) {
      continue;
    }

    selected.push(problem);
    usedIds.add(problemId);

    if (
      selected.length >= goalCount
    ) {
      return selected;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Second pass: fill remaining slots
  |--------------------------------------------------------------------------
  */

  for (const item of scored) {
    if (
      selected.length >= goalCount
    ) {
      break;
    }

    const problemId =
      Number(item.problem.id);

    if (usedIds.has(problemId)) {
      continue;
    }

    selected.push(item.problem);
    usedIds.add(problemId);
  }

  return selected;
};

/*
|--------------------------------------------------------------------------
| Distribute across week
|--------------------------------------------------------------------------
|
| <= 5 problems:
| Monday -> Friday
|
| > 5:
| Monday -> Sunday
|
|--------------------------------------------------------------------------
*/

const distributeProblemsAcrossWeek = (
  problems,
  weekStart,
) => {
  if (
    !problems ||
    problems.length === 0
  ) {
    return [];
  }

  const practiceDays =
    problems.length <= 5
      ? [0, 1, 2, 3, 4]
      : [0, 1, 2, 3, 4, 5, 6];

  return problems.map(
    (problem, index) => {
      const dayIndex =
        practiceDays[
          index %
            practiceDays.length
        ];

      const plannedDate =
        formatDate(
          addDays(
            weekStart,
            dayIndex,
          ),
        );

      return {
        problem,
        plannedDate,
        position: Math.floor(
          index /
            practiceDays.length,
        ),
      };
    },
  );
};

/*
|--------------------------------------------------------------------------
| Get existing plan
|--------------------------------------------------------------------------
*/

export const getPlan = async (
  userId,
  weekStart,
) => {
  return await plannerRepository.getPlanRepo(
    userId,
    weekStart,
  );
};

/*
|--------------------------------------------------------------------------
| Generate weekly draft
|--------------------------------------------------------------------------
*/

export const generateWeeklyDraft = async ({
  userId,
  weekStart,
  goalCount,
  topics,
  difficulties,
  mentorProblemIds = [],
}) => {
  const candidates =
    await plannerRepository.getCandidateProblemsRepo(
      {
        userId,
        topics,
        difficulties,
        limit: 200,
      },
    );

  const mentorIds = new Set(
    mentorProblemIds.map(Number),
  );

  const selected =
    selectProblems({
      candidates,
      goalCount,
      selectedTopics: topics,
      mentorProblemIds: mentorIds,
    });

  const monday =
    getMonday(
      new Date(
        `${weekStart}T00:00:00`,
      ),
    );

  const scheduled =
    distributeProblemsAcrossWeek(
      selected,
      monday,
    );

  const weekEnd = formatDate(
    addDays(monday, 6),
  );

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT
  |--------------------------------------------------------------------------
  | Draft now uses the SAME shape as PlannerItem.
  |
  | Do not return problemId/plannedDate here.
  |--------------------------------------------------------------------------
  */

  return {
    weekStart,
    weekEnd,
    goalCount,
    selectedCount:
      selected.length,

    items: scheduled.map(
      ({
        problem,
        plannedDate,
        position,
      }) => ({
        problem_id: Number(
          problem.id,
        ),

        planned_date:
          plannedDate,

        position,

        source:
          mentorIds.has(
            Number(problem.id),
          )
            ? "MENTOR"
            : "PLANNER",

        title:
          problem.title,

        difficulty:
          problem.difficulty,

        topic:
          problem.topic,

        tags:
          problem.tags,

        platform:
          problem.platform,

        question_link:
          problem.question_link,

        solved: false,
      }),
    ),
  };
};

/*
|--------------------------------------------------------------------------
| Create / replace weekly plan
|--------------------------------------------------------------------------
*/

export const saveWeeklyPlan = async ({
  userId,
  weekStart,
  weekEnd,
  goalCount,
  items,
}) => {
  let plan =
    await plannerRepository.getPlanRepo(
      userId,
      weekStart,
    );

  if (!plan) {
    plan =
      await plannerRepository.createPlanRepo(
        userId,
        weekStart,
        weekEnd,
        goalCount,
      );
  } else {
    plan =
      await plannerRepository.updatePlanRepo(
        plan.id,
        goalCount,
      );
  }

  await plannerRepository.deletePlanItemsRepo(
    plan.id,
  );

  for (
    let index = 0;
    index < items.length;
    index++
  ) {
    const item = items[index];

    await plannerRepository.addPlanItemRepo({
      planId: plan.id,

      problemId:
        Number(item.problemId),

      plannedDate:
        String(item.plannedDate).slice(
          0,
          10,
        ),

      position:
        Number(
          item.position ?? index,
        ),

      source:
        item.source || "USER",
    });
  }

  return await plannerRepository.getPlanRepo(
    userId,
    weekStart,
  );
};

/*
|--------------------------------------------------------------------------
| Update plan item
|--------------------------------------------------------------------------
*/

export const updatePlanItem = async ({
  userId,
  itemId,
  plannedDate,
  position,
}) => {
  const owner =
    await plannerRepository.getPlanItemOwnerRepo(
      itemId,
    );

  if (!owner) {
    throw new Error(
      "Planner item not found",
    );
  }

  if (
    String(owner.user_id) !==
    String(userId)
  ) {
    throw new Error(
      "Unauthorized planner item",
    );
  }

  return await plannerRepository.updatePlanItemRepo(
    {
      itemId,
      plannedDate,
      position,
    },
  );
};

/*
|--------------------------------------------------------------------------
| Delete plan item
|--------------------------------------------------------------------------
*/

export const deletePlanItem = async ({
  userId,
  itemId,
}) => {
  const owner =
    await plannerRepository.getPlanItemOwnerRepo(
      itemId,
    );

  if (!owner) {
    throw new Error(
      "Planner item not found",
    );
  }

  if (
    String(owner.user_id) !==
    String(userId)
  ) {
    throw new Error(
      "Unauthorized planner item",
    );
  }

  await plannerRepository.deletePlanItemRepo(
    itemId,
  );
};

/*
|--------------------------------------------------------------------------
| Progress
|--------------------------------------------------------------------------
*/

export const getPlanProgress = async ({
  userId,
  planId,
}) => {
  const owner =
    await plannerRepository.getPlanOwnerRepo(
      planId,
    );

  if (!owner) {
    throw new Error(
      "Planner plan not found",
    );
  }

  if (
    String(owner.user_id) !==
    String(userId)
  ) {
    throw new Error(
      "Unauthorized planner plan",
    );
  }

  return await plannerRepository.getPlanProgressRepo(
    userId,
    planId,
  );
};