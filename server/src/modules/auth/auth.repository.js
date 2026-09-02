import pool from '../../db/db.js';

export const findUserByEmail =  async(email) => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
};

export const createUser = async(name, email, password) => {
    const res  = await pool.query('INSERT INTO users( name, email, password) VALUES($1,$2,$3) RETURNING id, name, email ', [name, email, password]);
    return res.rows[0];
};

export const findUserById = async (userId) => {
  const res = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );

  return res.rows[0];
};

export const storeRefreshToken = async (userId, token) => {
  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
    [userId, token]
  );
};

export const deleteRefreshToken = async (refreshToken) => {
  await pool.query(
    "DELETE FROM refresh_tokens WHERE token=$1",
    [refreshToken]
  );
};


export const findRefreshToken = async (refreshToken) => {
  const result = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token=$1",
    [refreshToken]
  );

  return result.rows[0];
};

export const storePasswordResetToken = async (
  userId,
  token,
  expiresAt
) => {

  const query = `
    INSERT INTO password_resets (user_id, token, expires_at)
    VALUES ($1, $2, $3)
  `;

  await pool.query(query, [userId, token, expiresAt]);
};

export const deletePasswordResetToken = async (token) => {

  const query = `
    DELETE FROM password_resets
    WHERE token = $1
  `;

  await pool.query(query, [token]);
};

export const updateUserPassword = async (
  userId,
  password
) => {

  const query = `
    UPDATE users
    SET password = $1
    WHERE id = $2
  `;

  await pool.query(query, [password, userId]);
};

export const findPasswordResetToken = async (token) => {
  const result = await pool.query(
    `SELECT * FROM password_resets WHERE token = $1`,
    [token]
  );

  return result.rows[0];
};

export const deletePasswordResetTokensByUserId = async (userId) => {
  await pool.query(
    `DELETE FROM password_resets WHERE user_id = $1`,
    [userId]
  );
};