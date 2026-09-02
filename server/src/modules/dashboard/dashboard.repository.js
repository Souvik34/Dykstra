import pool from "../../db/db.js";


export const getWeakTopicRepo = async (userId) => {
  const result = await pool.query(
    `SELECT p.topic, COUNT(*) as count
     FROM solved_problems sp
     JOIN problems p ON sp.problem_id = p.id
     WHERE sp.user_id = $1
     GROUP BY p.topic
     ORDER BY count ASC
     LIMIT 1`,
    [userId]
  );

  return result.rows[0] || null;
};

export const getRecommendedProblemsRepo = async (topic) => {
  if (!topic) return [];

  const result = await pool.query(
    `SELECT * FROM problems
     WHERE topic = $1
     LIMIT 2`,
    [topic]
  );

  return result.rows;
};

export const getDailySolveRepo = async (userId) => {
  const result = await pool.query(
    `SELECT
       (solved_at AT TIME ZONE 'Asia/Kolkata')::date AS date,
       COUNT(*) AS count
     FROM solved_problems
     WHERE user_id = $1
     GROUP BY date
     ORDER BY date ASC`,
    [userId]
  );

  return result.rows;
};

export const getTopicDistributionRepo = async (userId) => {
  const result = await pool.query(
    `SELECT p.topic, COUNT(*) as count
     FROM solved_problems sp
     JOIN problems p ON sp.problem_id = p.id
     WHERE sp.user_id = $1
     GROUP BY p.topic
     ORDER BY count DESC`,
    [userId]
  );

  return result.rows;
};

export const getDifficultyDistributionRepo = async (userId) => {
  const result = await pool.query(
    `SELECT difficulty, COUNT(*) as count
     FROM solved_problems
     WHERE user_id = $1
     GROUP BY difficulty`,
    [userId]
  );

  return result.rows;
};

export const getStrongTopicsRepo =
async (userId) => {

const result =
await pool.query(

`
SELECT
p.topic,
COUNT(*)::int AS solved

FROM solved_problems sp

JOIN problems p
ON p.id = sp.problem_id

WHERE sp.user_id = $1

GROUP BY p.topic

ORDER BY solved DESC

LIMIT 5
`,

[userId]

);

return result.rows;

};

export const getRecentActivityRepo = async (userId) => {

const result = await pool.query(

`
SELECT

sp.solved_at,

p.title,

p.difficulty,

p.topic

FROM solved_problems sp

JOIN problems p

ON p.id = sp.problem_id

WHERE sp.user_id = $1

ORDER BY sp.solved_at DESC

LIMIT 8
`,

[userId]

);

return result.rows;

};

export const getTopicStrengthRepo = async (userId) => {

const result = await pool.query(

`
SELECT

p.topic,

COUNT(*)::int AS solved,

MAX(sp.solved_at) AS last_solved,

SUM(
CASE 
WHEN LOWER(sp.difficulty)='hard'
THEN 1
ELSE 0
END
)::int AS hard,

SUM(
CASE 
WHEN LOWER(sp.difficulty)='medium'
THEN 1
ELSE 0
END
)::int AS medium


FROM solved_problems sp


JOIN problems p

ON p.id = sp.problem_id


WHERE sp.user_id=$1


GROUP BY p.topic

ORDER BY solved DESC

`,

[userId]

);


return result.rows;

};