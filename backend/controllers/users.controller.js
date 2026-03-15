// controllers/users.controller.js
const pool = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');

const VALID_ROLES = ['admin', 'manager', 'staff'];

// GET /api/users
const getUsers = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, email, role, created_at
     FROM users
     ORDER BY created_at DESC`
  );
  res.json({ users: result.rows });
});

// GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ user: result.rows[0] });
});

// PATCH /api/users/:id/role
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({
      error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
    });
  }

  // Prevent admin from demoting themselves
  if (parseInt(req.params.id) === req.user.id && role !== 'admin') {
    return res.status(400).json({ error: 'You cannot change your own role.' });
  }

  const result = await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2
     RETURNING id, name, email, role`,
    [role, req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({ message: 'Role updated.', user: result.rows[0] });
});

// DELETE /api/users/:id  (admin only — soft approach: just remove from system)
const deleteUser = asyncHandler(async (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }

  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({ message: `User "${result.rows[0].name}" removed.` });
});

module.exports = { getUsers, getUserById, updateUserRole, deleteUser };