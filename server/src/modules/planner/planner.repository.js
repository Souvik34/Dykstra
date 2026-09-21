import pool from "../../db/db.js";


/*
|--------------------------------------------------------------------------
| Get existing plan
|--------------------------------------------------------------------------
*/

export const getPlanRepo = async (userId, weekStart) => {
  const planResult = await pool.query(
    `
    SELECT
      id,
      user_id,
      week_start,
      week_end,
      goal_count,
      created_at,
      updated_at
    FROM planner_plans
    WHERE user_id = $1
      AND week_start = $2
    `,
    [userId, weekStart]
  );

  if (planResult.rows.length === 0) {
    return null;
  }

  const plan = planResult.rows[0];

  const itemsResult = await pool.query(
    `
    SELECT
      ppi.id,
      ppi.problem_id,
      ppi.planned_date,
      ppi.position,
      ppi.source,

      p.title,
      p.difficulty,
      p.topic,
      p.tags,
      p.platform,
      p.question_link,

      CASE
        WHEN sp.problem_id IS NOT NULL THEN true
        ELSE false
      END AS solved

    FROM planner_plan_items ppi

    JOIN problems p
      ON p.id = ppi.problem_id

    LEFT JOIN solved_problems sp
      ON sp.problem_id = ppi.problem_id
      AND sp.user_id = $1

    WHERE ppi.plan_id = $2

    ORDER BY
      ppi.planned_date ASC,
      ppi.position ASC,
      ppi.id ASC
    `,
    [userId, plan.id]
  );

  return {
    ...plan,
    items: itemsResult.rows,
  };
};


/*
|--------------------------------------------------------------------------
| Create plan
|--------------------------------------------------------------------------
*/

export const createPlanRepo = async (
  userId,
  weekStart,
  weekEnd,
  goalCount
) => {
  const result = await pool.query(
    `
    INSERT INTO planner_plans (
      user_id,
      week_start,
      week_end,
      goal_count
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      userId,
      weekStart,
      weekEnd,
      goalCount,
    ]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| Update plan
|--------------------------------------------------------------------------
*/

export const updatePlanRepo = async (
  planId,
  goalCount
) => {
  const result = await pool.query(
    `
    UPDATE planner_plans
    SET
      goal_count = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,
    [
      planId,
      goalCount,
    ]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| Delete plan items
|--------------------------------------------------------------------------
*/

export const deletePlanItemsRepo = async (planId) => {
  await pool.query(
    `
    DELETE FROM planner_plan_items
    WHERE plan_id = $1
    `,
    [planId]
  );
};


/*
|--------------------------------------------------------------------------
| Add plan item
|--------------------------------------------------------------------------
*/

export const addPlanItemRepo = async ({
  planId,
  problemId,
  plannedDate,
  position,
  source,
}) => {
  const result = await pool.query(
    `
    INSERT INTO planner_plan_items (
      plan_id,
      problem_id,
      planned_date,
      position,
      source
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      planId,
      problemId,
      plannedDate,
      position,
      source,
    ]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| Update individual item
|--------------------------------------------------------------------------
*/

export const updatePlanItemRepo = async ({
  itemId,
  plannedDate,
  position,
}) => {
  const result = await pool.query(
    `
    UPDATE planner_plan_items
    SET
      planned_date = $2,
      position = $3
    WHERE id = $1
    RETURNING *
    `,
    [
      itemId,
      plannedDate,
      position,
    ]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| Delete individual item
|--------------------------------------------------------------------------
*/

export const deletePlanItemRepo = async (itemId) => {
  await pool.query(
    `
    DELETE FROM planner_plan_items
    WHERE id = $1
    `,
    [itemId]
  );
};


/*
|--------------------------------------------------------------------------
| Get candidate problems
|--------------------------------------------------------------------------
|
| Candidate problems come from YOUR custom problems DB.
|
| Already solved problems are excluded.
|
*/

export const getCandidateProblemsRepo = async ({
  userId,
  topics,
  difficulties,
  limit = 100,
}) => {
  const values = [userId];

  let query = `
    SELECT
      p.id,
      p.title,
      p.question_link,
      p.difficulty,
      p.topic,
      p.tags,
      p.platform
    FROM problems p
    WHERE NOT EXISTS (
      SELECT 1
      FROM solved_problems sp
      WHERE sp.user_id = $1
        AND sp.problem_id = p.id
    )
  `;

  if (topics && topics.length > 0) {
    values.push(
      topics.map((topic) =>
        String(topic).trim().toLowerCase(),
      ),
    );

    query += `
      AND LOWER(TRIM(p.topic)) =
          ANY($${values.length})
    `;
  }

  if (difficulties && difficulties.length > 0) {
    values.push(
      difficulties.map((difficulty) =>
        String(difficulty).trim().toLowerCase(),
      ),
    );

    query += `
      AND LOWER(TRIM(p.difficulty::text)) =
          ANY($${values.length})
    `;
  }

  values.push(limit);

  query += `
    ORDER BY p.id ASC
    LIMIT $${values.length}
  `;

  const result = await pool.query(
    query,
    values,
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| Get solved problem IDs
|--------------------------------------------------------------------------
*/

export const getSolvedProblemIdsRepo = async (
  userId
) => {
  const result = await pool.query(
    `
    SELECT problem_id
    FROM solved_problems
    WHERE user_id = $1
    `,
    [userId]
  );

  return result.rows.map(
    (row) => Number(row.problem_id)
  );
};


/*
|--------------------------------------------------------------------------
| Get plan progress
|--------------------------------------------------------------------------
*/

export const getPlanProgressRepo = async (
  userId,
  planId
) => {
  const result = await pool.query(
    `
    SELECT
      COUNT(ppi.id)::int AS total,

      COUNT(
        CASE
          WHEN sp.problem_id IS NOT NULL
          THEN 1
        END
      )::int AS solved

    FROM planner_plan_items ppi

    LEFT JOIN solved_problems sp
      ON sp.problem_id = ppi.problem_id
      AND sp.user_id = $1

    WHERE ppi.plan_id = $2
    `,
    [
      userId,
      planId,
    ]
  );

  const total = Number(result.rows[0].total);
  const solved = Number(result.rows[0].solved);

  return {
    total,
    solved,
    remaining: Math.max(total - solved, 0),
    percentage:
      total === 0
        ? 0
        : Math.round((solved / total) * 100),
  };
};


/*
|--------------------------------------------------------------------------
| Get plan item ownership
|--------------------------------------------------------------------------
|
| Used to ensure users cannot modify someone else's plan.
|--------------------------------------------------------------------------
*/

export const getPlanItemOwnerRepo = async (
  itemId
) => {
  const result = await pool.query(
    `
    SELECT
      ppi.id,
      pp.user_id,
      pp.id AS plan_id

    FROM planner_plan_items ppi

    JOIN planner_plans pp
      ON pp.id = ppi.plan_id

    WHERE ppi.id = $1
    `,
    [itemId]
  );

  return result.rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Get plan owner
|--------------------------------------------------------------------------
*/

export const getPlanOwnerRepo = async (
  planId
) => {
  const result = await pool.query(
    `
    SELECT
      id,
      user_id
    FROM planner_plans
    WHERE id = $1
    `,
    [planId]
  );

  return result.rows[0] || null;
};