import pool from "../../db/db.js";
export const getNotificationsRepo = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      id,
      type,
      title,
      message,
      metadata,
      read_at,
      created_at
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 20
    `,
    [userId]
  );

  return result.rows;
};

export const markNotificationReadRepo = async (userId, notificationId) => {
  const result = await pool.query(
    `
    UPDATE notifications
    SET read_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND user_id = $2
      AND read_at IS NULL
    RETURNING *
    `,
    [notificationId, userId]
  );

  return result.rows[0] || null;
};

export const markAllNotificationsReadRepo = async (userId) => {
  const result = await pool.query(
    `
    UPDATE notifications
    SET read_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
      AND read_at IS NULL
    `,
    [userId]
  );

  return result.rowCount;
};

export const getUnreadNotificationCountRepo = async (userId) => {
  const result = await pool.query(
    `
    SELECT COUNT(*)::INTEGER AS count
    FROM notifications
    WHERE user_id = $1
      AND read_at IS NULL
    `,
    [userId]
  );

  return result.rows[0].count;
};
export const createNotificationRepo = async ({
  userId,
  type,
  title,
  message,
  metadata = {},
}) => {
  const result = await pool.query(
    `
    INSERT INTO notifications
      (user_id, type, title, message, metadata)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      userId,
      type,
      title,
      message,
      metadata,
    ]
  );

  return result.rows[0];
};


export const createBroadcastRepo = async ({
  title,
  message,
  sendEmail,
  createdBy,
}) => {
  const result = await pool.query(
    `
    INSERT INTO broadcasts
      (title, message, send_email, created_by)
    VALUES
      ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      title,
      message,
      sendEmail,
      createdBy,
    ]
  );

  return result.rows[0];
};


export const getAllUsersForBroadcastRepo = async () => {
  const result = await pool.query(
    `
    SELECT id, name, email
    FROM users
    WHERE email IS NOT NULL
    `
  );

  return result.rows;
};


export const getPendingRevisionUsersRepo = async () => {
  const result = await pool.query(
    `
    SELECT
      u.id,
      u.name,
      u.email,
      COUNT(rq.id)::INTEGER AS pending_count
    FROM users u
    JOIN revision_queue rq
      ON rq.user_id = u.id
    WHERE
      u.revision_reminder_enabled = TRUE
      AND rq.is_completed = FALSE
      AND rq.next_revision_date <= CURRENT_DATE
      AND u.email IS NOT NULL
    GROUP BY
      u.id,
      u.name,
      u.email
    `
  );

  return result.rows;
};
export const hasRevisionReminderTodayRepo = async (userId) => {
  const result = await pool.query(
    `
    SELECT id
    FROM revision_reminder_log
    WHERE user_id = $1
      AND reminder_date = CURRENT_DATE
    LIMIT 1
    `,
    [userId]
  );

  return result.rows.length > 0;
};


export const logRevisionReminderRepo = async ({
  userId,
  pendingCount,
}) => {
  await pool.query(
    `
    INSERT INTO revision_reminder_log
      (user_id, reminder_date, pending_count)
    VALUES
      ($1, CURRENT_DATE, $2)
    ON CONFLICT (user_id, reminder_date)
    DO NOTHING
    `,
    [userId, pendingCount]
  );
};

export const getRevisionReminderPreferenceRepo = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      revision_reminder_enabled,
      revision_reminder_preference_set
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  return result.rows[0] || null;
};

export const updateRevisionReminderPreferenceRepo = async (
  userId,
  enabled
) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      revision_reminder_enabled = $2,
      revision_reminder_preference_set = TRUE
    WHERE id = $1
    RETURNING
      revision_reminder_enabled,
      revision_reminder_preference_set
    `,
    [userId, enabled]
  );

  return result.rows[0] || null;
};