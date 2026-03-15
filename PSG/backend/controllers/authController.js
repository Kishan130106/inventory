const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Register
const register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password)
    return res.status(400).json({ success: false, message: 'All fields are required.' });

  try {
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows.length > 0)
      return res.status(400).json({ success: false, message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password) VALUES ($1,$2,$3,$4) RETURNING id, first_name, last_name, email, role',
      [first_name, last_name, email, hashed]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required.' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const { password: _, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.message.includes('timeout') || err.message.includes('ETIMEDOUT') || err.message.includes('ENOTFOUND')) {
      return res.status(503).json({ success: false, message: 'Cannot connect to database. Check that PostgreSQL is running and remote access is enabled on 192.168.1.20.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id=$1', [req.user.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Send OTP (simplified - logs to console since email may not be configured)
const sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (user.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Email not found.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await pool.query('INSERT INTO otp_tokens (email, otp, expires_at) VALUES ($1,$2,$3)', [email, otp, expires]);
    console.log(`OTP for ${email}: ${otp}`); // In production, send via email

    res.json({ success: true, message: 'OTP sent to email.', otp }); // Remove otp from prod response
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify OTP and reset password
const resetPassword = async (req, res) => {
  const { email, otp, new_password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM otp_tokens WHERE email=$1 AND otp=$2 AND used=FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password=$1 WHERE email=$2', [hashed, email]);
    await pool.query('UPDATE otp_tokens SET used=TRUE WHERE id=$1', [result.rows[0].id]);

    res.json({ success: true, message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, sendOtp, resetPassword };
