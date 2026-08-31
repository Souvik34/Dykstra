import pool from "../../db/db.js";
import redisClient from "../../config/redis.js";

const safeArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") return val.split(",");
  return [];
};

const normalize = (val) => {
  if (!val || val.length === 0) return "all";
  if (Array.isArray(val)) return [...val].sort().join(",");
  return val;
};



export const getAllProblemsRepo = async (params) => {
 const {
  difficulty,
  topic,
  page = 1,
  limit = 50,
  search = "",
  ids
} = params;

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const cacheKey =
  `problems:v1:` +
  `d:${normalize(difficulty)}:` +
  `t:${normalize(topic)}:` +
  `ids:${normalize(ids)}:` +
  `p:${pageNum}:l:${limitNum}:s:${search || "none"}`;

  /* ---------- REDIS GET ---------- */
  let cachedData;

  try {
    cachedData = await redisClient.get(cacheKey);
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  if (cachedData) {
    console.log("CACHE HIT");
    return JSON.parse(cachedData);
  }

  console.log("CACHE MISS");

  /* ---------- SQL QUERY ---------- */
  const difficultyArr = safeArray(difficulty);
const topicArr = safeArray(topic);
const idsArr = safeArray(ids).map(Number);

let query = "SELECT * FROM problems WHERE 1=1";
const values = [];

if (difficultyArr.length > 0) {
  values.push(difficultyArr);
  query += ` AND difficulty = ANY($${values.length})`;
}

if (topicArr.length > 0) {
  values.push(topicArr);
  query += ` AND topic = ANY($${values.length})`;
}
if (idsArr.length > 0) {
  values.push(idsArr);
  query += ` AND id = ANY($${values.length})`;
}
  if (search) {
    values.push(`%${search}%`);
    query += ` AND title ILIKE $${values.length}`;
  }

  const offset = (pageNum - 1) * limitNum;

  values.push(limitNum);
  values.push(offset);

  query += ` ORDER BY id ASC LIMIT $${values.length - 1} OFFSET $${values.length}`;

  const result = await pool.query(query, values);
  const updatedResult = await pool.query(
  `SELECT MAX(updated_at) AS last_updated FROM problems`
);

  try {
await redisClient.setEx(
  cacheKey,
  300,
  JSON.stringify({
    problems: result.rows,
    lastUpdated: updatedResult.rows[0].last_updated,
  })
);
  } catch (err) {
    console.error("Redis SET error:", err);
  }

 return {
  problems: result.rows,
  lastUpdated: updatedResult.rows[0].last_updated,
};
};



export const addBookmarkRepo = async (userId, problemId) => {
  await pool.query(
    `
    INSERT INTO bookmarks (user_id, problem_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, problem_id) DO NOTHING
    `,
    [userId, problemId]
  );

  await redisClient.del(`bookmarks:${userId}`);
};

export const removeBookmarkRepo = async (userId, problemId) => {
  await pool.query(
    `
    DELETE FROM bookmarks
    WHERE user_id = $1
      AND problem_id = $2
    `,
    [userId, problemId]
  );

  await redisClient.del(`bookmarks:${userId}`);
};

export const getBookmarksRepo = async (userId) => {
  const cacheKey = `bookmarks:${userId}`;

  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const result = await pool.query(
    `
    SELECT problem_id
    FROM bookmarks
    WHERE user_id = $1
    `,
    [userId]
  );

  await redisClient.setEx(
    cacheKey,
    300,
    JSON.stringify(result.rows)
  );

  return result.rows;
};


export const getProblemByIdRepo = async (id) => {
  const cacheKey = `problem:${id}`;

  let cached;

  try {
    cached = await redisClient.get(cacheKey);
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  if (cached) return JSON.parse(cached);

  const result = await pool.query(
    "SELECT * FROM problems WHERE id = $1",
    [id]
  );

  if (result.rows.length === 0) return null;

  try {
    await redisClient.setEx(cacheKey, 300, JSON.stringify(result.rows[0]));
  } catch (err) {
    console.error("Redis SET error:", err);
  }

  return result.rows[0];
};


export const createProblemRepo = async (data) => {
  const {
    title,
    question_link,
    difficulty,
    topic,
    tags,
    platform
  } = data;

  const result = await pool.query(
    `INSERT INTO problems 
    (title, question_link, difficulty, topic, tags, platform)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *`,
    [
      title,
      question_link,
      difficulty,
      topic,
      tags,
      platform
    ]
  );

  try {
    await redisClient.del(`problem:${result.rows[0].id}`);
  } catch (err) {
    console.error("Redis delete error:", err);
  }

  return result.rows[0];
};

export const insertSolvedProblemRepo = async (
  userId,
  problemId,
  difficulty
) => {
  return await pool.query(
    `INSERT INTO solved_problems (user_id, problem_id, difficulty)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [userId, problemId, difficulty]
  );
};

export const getProgressRepo = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      problem_id,
      difficulty,
      solved_at,
      started_at,
      time_taken_minutes,
      felt_difficulty,
      confidence_rating
    FROM solved_problems
    WHERE user_id = $1
    ORDER BY solved_at DESC
    `,
    [userId]
  );

  return result.rows;
};

export const saveNotesRepo = async (userId, problemId, notes) => {
  await pool.query(
    `
    INSERT INTO problem_notes (user_id, problem_id, notes)
    VALUES ($1,$2,$3)
    ON CONFLICT (user_id, problem_id)
    DO UPDATE SET
      notes = EXCLUDED.notes,
      updated_at = CURRENT_TIMESTAMP
    `,
    [userId, problemId, notes]
  );

  await redisClient.del(`notes:${userId}`);
};

export const getNotesRepo = async (userId) => {
  const cacheKey = `notes:${userId}`;

  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const result = await pool.query(
    `
    SELECT problem_id, notes
    FROM problem_notes
    WHERE user_id = $1
    `,
    [userId]
  );

  await redisClient.setEx(
    cacheKey,
    300,
    JSON.stringify(result.rows)
  );

  return result.rows;
};

export const getProblemNotesRepo = async (userId, problemId) => {
  const result = await pool.query(
    `
    SELECT notes
    FROM problem_notes
    WHERE user_id = $1
      AND problem_id = $2
    `,
    [userId, problemId]
  );

  return result.rows[0] || null;
};

export const getMentorProblemsRepo = async (
    userId,
    topic,
    limit = 3
) => {
    const result = await pool.query(
        `
        SELECT
            p.id,
            p.title,
            p.difficulty,
            p.topic,
            p.question_link
        FROM problems p
        WHERE LOWER(p.topic) = LOWER($2)

        AND NOT EXISTS (
            SELECT 1
            FROM solved_problems sp
            WHERE sp.user_id = $1
              AND sp.problem_id = p.id
        )

        ORDER BY
            CASE LOWER(p.difficulty::text)
                WHEN 'easy' THEN 1
                WHEN 'medium' THEN 2
                WHEN 'hard' THEN 3
                ELSE 4
            END,
            p.id

        LIMIT $3
        `,
        [userId, topic, limit]
    );

    return result.rows;
};

 export const startProblemAttemptRepo = async (
  userId,
  problemId
) => {
  console.log("START REPO:", {
    userId,
    problemId,
  });

  const active = await pool.query(
    `
    SELECT *
    FROM problem_attempts
    WHERE user_id = $1
      AND status = 'STARTED'
    `,
    [userId]
  );

  console.log("ACTIVE ATTEMPT:", active.rows[0]);

  if (active.rows.length > 0) {
    return {
      blocked: true,
      attempt: active.rows[0],
    };
  }

  const result = await pool.query(
    `
    INSERT INTO problem_attempts (
      user_id,
      problem_id,
      status
    )
    VALUES ($1, $2, 'STARTED')
    RETURNING *
    `,
    [userId, problemId]
  );

  console.log("INSERTED ATTEMPT:", result.rows[0]);

 
 
  return {
    blocked: false,
    attempt: result.rows[0],
  };
};
export const completeProblemAttemptRepo = async (
    userId,
    problemId
)=>{

const result = await pool.query(
`
UPDATE problem_attempts

SET 
status='COMPLETED',
completed_at=CURRENT_TIMESTAMP

WHERE user_id=$1
AND problem_id=$2
AND status='STARTED'

RETURNING 
EXTRACT(EPOCH FROM 
(completed_at-started_at)
)/60 AS minutes

`,
[
userId,
problemId
]
);


return result.rows[0];

};

export const getMentorProblemsByIdsRepo = async (problemIds) => {
    if (!problemIds || problemIds.length === 0) {
        return [];
    }

    const result = await pool.query(
        `
        SELECT
            id,
            title,
            difficulty,
            topic,
            question_link
        FROM problems
        WHERE id = ANY($1::int[])
        ORDER BY array_position($1::int[], id)
        `,
        [problemIds]
    );

    return result.rows;
};