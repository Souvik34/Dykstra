import pool from "../../db/db.js";
import redisClient from "../../config/redis.js";

export const insertRevisionRepo = async (userId, problemId) => {
  await pool.query(
    `INSERT INTO revision_queue (user_id, problem_id, next_revision_date)
     VALUES ($1, $2, CURRENT_DATE + INTERVAL '1 day')
     ON CONFLICT (user_id, problem_id) DO NOTHING`,
    [userId, problemId]
  );

  await redisClient.del(`revision:all:${userId}`);
  await redisClient.del(`revision:due:${userId}`);
};

export const getDueRevisionsRepo = async (userId) => {
  const cacheKey = `revision:due:${userId}`;

  const cached = await redisClient.get(cacheKey);

  if (cached) {
    console.log("CACHE HIT (due revisions)");
    return JSON.parse(cached);
  }

  console.log("CACHE MISS (due revisions)");

  const result = await pool.query(
    `
    SELECT
      rq.*,
      sp.felt_difficulty,
      sp.confidence_rating,
      sp.time_taken_minutes,
      p.topic,
      p.title,
      p.question_link

    FROM revision_queue rq

    JOIN solved_problems sp
      ON rq.user_id = sp.user_id
      AND rq.problem_id = sp.problem_id

    JOIN problems p
      ON rq.problem_id = p.id

    WHERE rq.user_id = $1
      AND rq.is_completed = FALSE
      AND rq.next_revision_date <= CURRENT_DATE
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

export const getAllRevisionsRepo = async (userId) => {
  const cacheKey = `revision:all:${userId}`;

  const cached = await redisClient.get(cacheKey);

  if (cached) {
    console.log("CACHE HIT (all revisions)");
    return JSON.parse(cached);
  }

  console.log("CACHE MISS (all revisions)");

  const result = await pool.query(
    `
    SELECT
      rq.*,
      sp.felt_difficulty,
      sp.confidence_rating,
      sp.time_taken_minutes,
      p.title,
      p.topic,
      p.question_link

    FROM revision_queue rq

    JOIN problems p
      ON rq.problem_id = p.id

    LEFT JOIN solved_problems sp
      ON rq.user_id = sp.user_id
      AND rq.problem_id = sp.problem_id

    WHERE rq.user_id = $1

    ORDER BY
      rq.is_completed ASC,
      rq.next_revision_date ASC
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
export const getRevisionByProblemRepo = async (
  userId,
  problemId
) => {
  const result = await pool.query(
    `SELECT *
     FROM revision_queue
     WHERE user_id = $1
       AND problem_id = $2`,
    [userId, problemId]
  );

  return result.rows[0];
};

export const updateRevisionRepo = async (
  userId,
  problemId,
  nextDate
) => {
  await pool.query(
    `UPDATE revision_queue
     SET
       revision_count = revision_count + 1,
       next_revision_date = $1
     WHERE user_id = $2
       AND problem_id = $3`,
    [nextDate, userId, problemId]
  );

  await redisClient.del(`revision:due:${userId}`);
  await redisClient.del(`revision:all:${userId}`);
};

export const markCompletedRepo = async (
  userId,
  problemId
) => {
  await pool.query(
    `UPDATE revision_queue
     SET is_completed = TRUE
     WHERE user_id = $1
       AND problem_id = $2`,
    [userId, problemId]
  );

  await redisClient.del(`revision:due:${userId}`);
  await redisClient.del(`revision:all:${userId}`);
};

export const getSolvedProblemForRevisionRepo = async (
  userId,
  problemId
) => {
  const result = await pool.query(
    `
    SELECT
      confidence_rating,
      felt_difficulty,
      time_taken_minutes
    FROM solved_problems
    WHERE user_id = $1
      AND problem_id = $2
    `,
    [userId, problemId]
  );

  return result.rows[0];
};

export const updateConfidenceRepo = async (
  userId,
  problemId,
  confidence
) => {
  await pool.query(
    `
    UPDATE solved_problems
    SET confidence_rating = $1
    WHERE user_id = $2
      AND problem_id = $3
    `,
    [confidence, userId, problemId]
  );
};