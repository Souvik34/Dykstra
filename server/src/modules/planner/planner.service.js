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
    result.getDate() + diff
  );

  return result;
};


const addDays = (date, days) => {
  const result = new Date(date);

  result.setDate(
    result.getDate() + days
  );

  return result;
};


/*
|--------------------------------------------------------------------------
| Difficulty normalization
|--------------------------------------------------------------------------
*/

const normalizeDifficulty = (
  difficulty
) => {
  if (!difficulty) {
    return "";
  }

  return String(difficulty)
    .trim()
    .toLowerCase();
};


/*
|--------------------------------------------------------------------------
| Build candidate score
|--------------------------------------------------------------------------
|
| Higher score = stronger candidate.
|--------------------------------------------------------------------------
*/

const scoreProblem = (
  problem,
  {
    mentorProblemIds,
    selectedTopics,
  }
) => {
  let score = 0;

  const problemId =
    Number(problem.id);


  /*
  |--------------------------------------------------------------------------
  | Mentor priority
  |--------------------------------------------------------------------------
  */

  if (
    mentorProblemIds.has(problemId)
  ) {
    score += 1000;
  }


  /*
  |--------------------------------------------------------------------------
  | Topic preference
  |--------------------------------------------------------------------------
  */

  if (
    selectedTopics.includes(
      problem.topic
    )
  ) {
    score += 100;
  }


  /*
  |--------------------------------------------------------------------------
  | Difficulty balance
  |--------------------------------------------------------------------------
  |
  | Prefer Easy/Medium before Hard.
  |
  */

  const difficulty =
    normalizeDifficulty(
      problem.difficulty
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


  /*
  |--------------------------------------------------------------------------
  | Stable tie breaker
  |--------------------------------------------------------------------------
  */

  score +=
    Math.max(
      0,
      10_000 - problemId
    ) /
    100_000;


  return score;
};


/*
|--------------------------------------------------------------------------
| Select balanced problems
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


  const scored =
    candidates
      .map((problem) => ({
        problem,

        score: scoreProblem(
          problem,
          {
            mentorProblemIds,
            selectedTopics,
          }
        ),
      }))
      .sort(
        (a, b) =>
          b.score - a.score
      );


  /*
  |--------------------------------------------------------------------------
  | First pass:
  | Try to cover every selected topic.
  |--------------------------------------------------------------------------
  */

  const selected = [];

  const usedIds =
    new Set();

  const topicBuckets =
    new Map();


  for (const item of scored) {
    const topic =
      item.problem.topic;

    if (
      !topicBuckets.has(topic)
    ) {
      topicBuckets.set(
        topic,
        []
      );
    }

    topicBuckets
      .get(topic)
      .push(item.problem);
  }


  for (
    const topic of selectedTopics
  ) {
    const bucket =
      topicBuckets.get(topic);

    if (
      !bucket ||
      bucket.length === 0
    ) {
      continue;
    }

    const problem =
      bucket[0];

    selected.push(problem);

    usedIds.add(
      Number(problem.id)
    );

    if (
      selected.length >= goalCount
    ) {
      return selected;
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Second pass:
  | Fill remaining slots according to score.
  |--------------------------------------------------------------------------
  */

  for (const item of scored) {
    if (
      selected.length >= goalCount
    ) {
      break;
    }

    const id =
      Number(item.problem.id);

    if (
      usedIds.has(id)
    ) {
      continue;
    }

    selected.push(
      item.problem
    );

    usedIds.add(id);
  }


  return selected;
};


/*
|--------------------------------------------------------------------------
| Build weekly dates
|--------------------------------------------------------------------------
*/

const distributeProblemsAcrossWeek = (
  problems,
  weekStart
) => {
  if (
    problems.length === 0
  ) {
    return [];
  }


  /*
  |--------------------------------------------------------------------------
  | Practice days are Monday-Friday.
  |--------------------------------------------------------------------------
  |
  | If there are more than 5 problems,
  | Saturday/Sunday are used as well.
  |
  */

  const practiceDays =
    problems.length <= 5
      ? [0, 1, 2, 3, 4]
      : [0, 1, 2, 3, 4, 5, 6];


  return problems.map(
    (problem, index) => {
      const dayIndex =
        practiceDays[
          index % practiceDays.length
        ];

      return {
        problem,
        plannedDate:
          formatDate(
            addDays(
              weekStart,
              dayIndex
            )
          ),
        position:
          Math.floor(
            index /
              practiceDays.length
          ),
      };
    }
  );
};


/*
|--------------------------------------------------------------------------
| Get existing plan
|--------------------------------------------------------------------------
*/

export const getPlan = async (
  userId,
  weekStart
) => {
  return await plannerRepository
    .getPlanRepo(
      userId,
      weekStart
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
    await plannerRepository
      .getCandidateProblemsRepo({
        userId,
        topics,
        difficulties,
        limit: 200,
      });


  const mentorIds =
    new Set(
      mentorProblemIds.map(
        Number
      )
    );


  const selected =
    selectProblems({
      candidates,
      goalCount,
      selectedTopics: topics,
      mentorProblemIds: mentorIds,
    });


  const monday =
    new Date(
      `${weekStart}T00:00:00`
    );


  const scheduled =
    distributeProblemsAcrossWeek(
      selected,
      monday
    );


  return {
    weekStart,
    goalCount,
    selectedCount:
      selected.length,
    items:
      scheduled.map(
        ({
          problem,
          plannedDate,
          position,
        }) => ({
          problemId:
            problem.id,

          title:
            problem.title,

          difficulty:
            problem.difficulty,

          topic:
            problem.topic,

          questionLink:
            problem.question_link,

          tags:
            problem.tags,

          platform:
            problem.platform,

          plannedDate,

          position,

          source:
            mentorIds.has(
              Number(problem.id)
            )
              ? "MENTOR"
              : "PLANNER",
        })
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
    await plannerRepository
      .getPlanRepo(
        userId,
        weekStart
      );


  /*
  |--------------------------------------------------------------------------
  | Create plan
  |--------------------------------------------------------------------------
  */

  if (!plan) {
    plan =
      await plannerRepository
        .createPlanRepo(
          userId,
          weekStart,
          weekEnd,
          goalCount
        );
  } else {
    plan =
      await plannerRepository
        .updatePlanRepo(
          plan.id,
          goalCount
        );
  }


  /*
  |--------------------------------------------------------------------------
  | Replace draft items
  |--------------------------------------------------------------------------
  |
  | Planner editing is easiest when the frontend
  | sends the current complete plan.
  |
  */

  await plannerRepository
    .deletePlanItemsRepo(
      plan.id
    );


  for (
    let index = 0;
    index < items.length;
    index++
  ) {
    const item =
      items[index];


    await plannerRepository
      .addPlanItemRepo({
        planId:
          plan.id,

        problemId:
          Number(
            item.problemId
          ),

        plannedDate:
          item.plannedDate,

        position:
          Number(
            item.position ??
              index
          ),

        source:
          item.source ||
          "USER",
      });
  }


  return await plannerRepository
    .getPlanRepo(
      userId,
      weekStart
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
    await plannerRepository
      .getPlanItemOwnerRepo(
        itemId
      );


  if (!owner) {
    throw new Error(
      "Planner item not found"
    );
  }


  if (
    owner.user_id !== userId
  ) {
    throw new Error(
      "Unauthorized planner item"
    );
  }


  return await plannerRepository
    .updatePlanItemRepo({
      itemId,
      plannedDate,
      position,
    });
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
    await plannerRepository
      .getPlanItemOwnerRepo(
        itemId
      );


  if (!owner) {
    throw new Error(
      "Planner item not found"
    );
  }


  if (
    owner.user_id !== userId
  ) {
    throw new Error(
      "Unauthorized planner item"
    );
  }


  await plannerRepository
    .deletePlanItemRepo(
      itemId
    );
};


/*
|--------------------------------------------------------------------------
| Get progress
|--------------------------------------------------------------------------
*/

export const getPlanProgress = async ({
  userId,
  planId,
}) => {
  const owner =
    await plannerRepository
      .getPlanOwnerRepo(
        planId
      );


  if (!owner) {
    throw new Error(
      "Planner plan not found"
    );
  }


  if (
    owner.user_id !== userId
  ) {
    throw new Error(
      "Unauthorized planner plan"
    );
  }


  return await plannerRepository
    .getPlanProgressRepo(
      userId,
      planId
    );
};