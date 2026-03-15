// controllers/auth.controller.js
const pool = require('../db/pool');
const googleClient = require('../config/google');
const { generateToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');
const { generateOTP, saveOTP, verifyOTP, clearOTP } = require('../services/otp.service');
const { sendOTPEmail } = require('../services/email.service');

// POST /api/auth/google
// Verifies Google ID token from @react-oauth/google on frontend
const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: 'Google credential is required.' });
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { sub: google_id, email, name, picture } = ticket.getPayload();

  const result = await pool.query(
    `INSERT INTO users (google_id, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (google_id) DO UPDATE SET name = EXCLUDED.name
     RETURNING id, google_id, email, name, role, created_at`,
    [google_id, email, name]
  );

  const user = result.rows[0];
  const token = generateToken(user);

  res.json({
    message: 'Login successful.',
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: picture },
  });
});

// POST /api/auth/otp/request
const requestOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const userResult = await pool.query(
    'SELECT id, name FROM users WHERE email = $1',
    [email]
  );

  // Always return the same message — don't reveal if email exists
  if (userResult.rows.length === 0) {
    return res.json({ message: 'If this email exists, an OTP has been sent.' });
  }

  const user = userResult.rows[0];
  const otp = generateOTP();
  await saveOTP(user.id, otp);
  await sendOTPEmail(email, user.name, otp);

  res.json({ message: 'If this email exists, an OTP has been sent.' });
});

// POST /api/auth/otp/verify
const verifyOTPHandler = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required.' });
  }

  const user = await verifyOTP(email, otp); // throws if invalid/expired
  await clearOTP(user.id);

  const token = generateToken(user);
  res.json({
    message: 'OTP verified successfully.',
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ user: result.rows[0] });
});

module.exports = { googleLogin, requestOTP, verifyOTP: verifyOTPHandler, getMe };