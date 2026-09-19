import pool from "../../db/db.js";

export const getPublicStatsService = async () => {
  const [
    usersResult,
    interviewsResult,
    revisionsResult,
  ] = await Promise.all([
    pool.query(`
      SELECT COUNT(*)::int AS count
      FROM users
    `),

    pool.query(`
      SELECT COUNT(*)::int AS count
      FROM interview_sessions
    `),

    pool.query(`
      SELECT COALESCE(SUM(revision_count), 0)::int AS count
      FROM revision_queue
    `),
  ]);

  return {
    users: usersResult.rows[0].count,
    interviews: interviewsResult.rows[0].count,
    revisions: revisionsResult.rows[0].count,
  };
};