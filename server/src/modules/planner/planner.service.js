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

const getToday = () => {
  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(new Date());

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return new Date(
    `${values.year}-${values.month}-${values.day}T00:00:00`,
  );
};

const isPastDate = (dateString) => {
  const date = new Date(
    `${String(dateString).slice(0, 10)}T00:00:00`,
  );

  date.setHours(0, 0, 0, 0);

  return date < getToday();
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
  leaveDates = [],
) => {
  if (!problems || problems.length === 0) {
    return [];
  }

  const weekStartString =
    String(weekStart).slice(0, 10);

  const parsedWeekStart = new Date(
    `${weekStartString}T00:00:00`,
  );

  if (Number.isNaN(parsedWeekStart.getTime())) {
    throw new Error(
      `Invalid planner weekStart: ${weekStart}`,
    );
  }

  const monday = getMonday(parsedWeekStart);
  const today = getToday();

  const leaveSet = new Set(
    leaveDates.map((date) =>
      String(date).slice(0, 10),
    ),
  );

  const daysSinceMonday = Math.floor(
    (today.getTime() - monday.getTime()) /
      (24 * 60 * 60 * 1000),
  );

  const startDayIndex =
    daysSinceMonday >= 0 &&
    daysSinceMonday <= 6
      ? daysSinceMonday
      : 0;

  const availableDays = [];

  for (
    let dayIndex = startDayIndex;
    dayIndex <= 6;
    dayIndex++
  ) {
    const date = formatDate(
      addDays(monday, dayIndex),
    );

    if (leaveSet.has(date)) {
      continue;
    }

    availableDays.push({
      dayIndex,
      date,
    });
  }

  if (availableDays.length === 0) {
    throw new Error(
      "No available days remain in this week",
    );
  }

  return problems.map((problem, index) => {
    const day =
      availableDays[
        index % availableDays.length
      ];

    return {
      problem,
      plannedDate: day.date,
      position: Math.floor(
        index / availableDays.length,
      ),
    };
  });
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
const existingPlan =
  await plannerRepository.getPlanRepo(
    userId,
    weekStart,
  );

const leaveDates =
  existingPlan?.leaves?.map(
    (leave) => leave.leave_date,
  ) ?? [];
  const scheduled =
  distributeProblemsAcrossWeek(
    selected,
    formatDate(monday),
    leaveDates,
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

  await plannerRepository.deletePlanItemsFromDateRepo(
  plan.id,
  formatDate(getToday()),
);
const planLeaves =
  await plannerRepository.getPlanLeavesRepo(
    plan.id,
  );

const leaveDates = new Set(
  planLeaves.map((leave) =>
    String(leave.leave_date).slice(0, 10),
  ),
);

for (
  let index = 0;
  index < items.length;
  index++
) {
  const item = items[index];

  const plannedDate =
    String(item.plannedDate).slice(0, 10);

  if (leaveDates.has(plannedDate)) {
    continue;
  }

  if (isPastDate(plannedDate)) {
    continue;
  }

  await plannerRepository.addPlanItemRepo({
    planId: plan.id,
    problemId: Number(item.problemId),
    plannedDate,
    position: Number(item.position ?? index),
    source: item.source || "USER",
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
const currentDate =
  String(owner.planned_date).slice(0, 10);

const newDate =
  String(plannedDate).slice(0, 10);

if (isPastDate(currentDate)) {
  throw new Error(
    "Past planner days are locked",
  );
}

if (isPastDate(newDate)) {
  throw new Error(
    "Past planner days are locked",
  );
}
const planLeaves =
  await plannerRepository.getPlanLeavesRepo(
    owner.plan_id,
  );

const leaveDates = new Set(
  planLeaves.map((leave) =>
    String(leave.leave_date).slice(0, 10),
  ),
);

if (leaveDates.has(newDate)) {
  throw new Error(
    "Cannot move a task to a leave day",
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
const itemDate =
  String(owner.planned_date).slice(0, 10);

if (isPastDate(itemDate)) {
  throw new Error("Past planner days are locked");
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

export const getSuggestions = async ({
  userId,
  topic,
  difficulties,
}) => {
  return plannerRepository.getPlannerSuggestionsRepo({
    userId,
    topic,
    difficulties,
    limit: 100,
  });
};

export const addPlanItem = async ({
  userId,
  weekStart,
  problemId,
  plannedDate,
  position,
  source = "USER",
}) => {
  const planDate = String(plannedDate).slice(0, 10);

if (isPastDate(planDate)) {
  throw new Error("Past planner days are locked");
}

 const plan =
  await plannerRepository.getPlanRepo(
    userId,
    weekStart,
  );

if (!plan) {
  throw new Error("Planner week not found");
}

const planLeaves =
  await plannerRepository.getPlanLeavesRepo(plan.id);

const leaveDates = new Set(
  planLeaves.map((leave) =>
    String(leave.leave_date).slice(0, 10),
  ),
);

const normalizedPlannedDate =
  String(plannedDate).slice(0, 10);

if (leaveDates.has(normalizedPlannedDate)) {
  throw new Error("Cannot add a task to a leave day");
}

if (isPastDate(normalizedPlannedDate)) {
  throw new Error("Cannot add a task to a past day");
}

return plannerRepository.addPlanItemRepo({
  planId: plan.id,
  problemId,
  plannedDate: normalizedPlannedDate,
  position,
  source,
});
}

export const getPlanLeaves = async ({
  userId,
  weekStart,
}) => {
  const plan =
    await plannerRepository.getPlanRepo(
      userId,
      weekStart,
    );

  if (!plan) {
    return [];
  }

  return plannerRepository.getPlanLeavesRepo(
    plan.id,
  );
};

export const setPlanLeave = async ({
  userId,
  weekStart,
  leaveDate,
}) => {
  const normalizedLeaveDate =
    String(leaveDate).slice(0, 10);
const monday = getMonday(
  new Date(
    `${String(weekStart).slice(0, 10)}T00:00:00`,
  ),
);

const weekEnd = formatDate(
  addDays(monday, 6),
);

if (
  normalizedLeaveDate <
    formatDate(monday) ||
  normalizedLeaveDate >
    weekEnd
) {
  throw new Error(
    "Leave date must belong to the selected planner week",
  );
}
  if (isPastDate(normalizedLeaveDate)) {
    throw new Error("Cannot set leave for a past day");
  }

  let plan =
    await plannerRepository.getPlanRepo(
      userId,
      weekStart,
    );

  if (!plan) {
    plan =
      await plannerRepository.createPlanRepo({
        userId,
        weekStart,
        goalCount: 5,
      });
  }

  const existingLeaves = new Set(
    (plan.leaves ?? []).map((leave) =>
      String(leave.leave_date).slice(0, 10),
    ),
  );

  if (existingLeaves.has(normalizedLeaveDate)) {
    return plannerRepository.getPlanRepo(
      userId,
      weekStart,
    );
  }

  const affectedItems =
    (plan.items ?? []).filter(
      (item) =>
        String(item.planned_date).slice(0, 10) ===
        normalizedLeaveDate,
    );


  const today = getToday();

  const availableDays = [];

  for (let dayIndex = 0; dayIndex <= 6; dayIndex++) {
    const date = formatDate(
      addDays(monday, dayIndex),
    );

    if (isPastDate(date)) continue;
    if (date === normalizedLeaveDate) continue;
    if (existingLeaves.has(date)) continue;

    availableDays.push(date);
  }

  if (
    affectedItems.length > 0 &&
    availableDays.length === 0
  ) {
    throw new Error(
      "Cannot mark leave: no available days remain for these tasks",
    );
  }

  await plannerRepository.addPlanLeaveRepo({
    planId: plan.id,
    leaveDate: normalizedLeaveDate,
  });

  if (affectedItems.length > 0) {
    const positionCounts = {};

    for (const item of plan.items ?? []) {
      const date = String(item.planned_date).slice(0, 10);

      if (
        date !== normalizedLeaveDate &&
        !existingLeaves.has(date) &&
        !isPastDate(date)
      ) {
        positionCounts[date] =
          (positionCounts[date] ?? 0) + 1;
      }
    }

    for (let index = 0; index < affectedItems.length; index++) {
      const targetDate =
        availableDays[
          index % availableDays.length
        ];

      const position =
        positionCounts[targetDate] ?? 0;

      await plannerRepository.updatePlanItemRepo({
        itemId: affectedItems[index].id,
        plannedDate: targetDate,
        position,
      });

      positionCounts[targetDate] = position + 1;
    }
  }

  return plannerRepository.getPlanRepo(
    userId,
    weekStart,
  );
};
export const removePlanLeave = async ({
  userId,
  weekStart,
  leaveDate,
}) => {
  const normalizedLeaveDate =
    String(leaveDate).slice(0, 10);

  if (isPastDate(normalizedLeaveDate)) {
    throw new Error("Cannot modify leave for a past day");
  }

  const plan =
    await plannerRepository.getPlanRepo(
      userId,
      weekStart,
    );

  if (!plan) {
    throw new Error("Planner week not found");
  }

  await plannerRepository.deletePlanLeaveRepo({
    planId: plan.id,
    leaveDate: normalizedLeaveDate,
  });

  return plannerRepository.getPlanRepo(
    userId,
    weekStart,
  );
};