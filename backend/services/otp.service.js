// services/otp.service.js
const pool = require('../db/pool');

/**
 * Generate a 6-digit OTP string.
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Save OTP to user record with 10-minute expiry.
 */
const saveOTP = async (userId, otp) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await pool.query(
    'UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3',
    [otp, expiresAt, userId]
  );
};

/**
 * Verify OTP for a given email.
 * Returns the user row if valid, throws descriptive errors if not.
 */
const verifyOTP = async (email, otp) => {
  const result = await pool.query(
    `SELECT id, email, name, role, otp_code, otp_expires_at
     FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    const err = new Error('Invalid OTP.');
    err.status = 400;
    throw err;
  }

  const user = result.rows[0];

  if (user.otp_code !== otp) {
    const err = new Error('Invalid OTP.');
    err.status = 400;
    throw err;
  }

  if (new Date() > new Date(user.otp_expires_at)) {
    const err = new Error('OTP has expired. Please request a new one.');
    err.status = 400;
    throw err;
  }

  return user;
};

/**
 * Clear OTP fields after successful verification.
 */
const clearOTP = async (userId) => {
  await pool.query(
    'UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = $1',
    [userId]
  );
};

module.exports = { generateOTP, saveOTP, verifyOTP, clearOTP };
