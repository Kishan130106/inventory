// routes/users.routes.js
const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const c = require('../controllers/users.controller');

// All user management is admin-only
router.get('/', authenticate, requireRole('admin'), c.getUsers);
router.get('/:id', authenticate, requireRole('admin'), c.getUserById);
router.patch('/:id/role', authenticate, requireRole('admin'), c.updateUserRole);
router.delete('/:id', authenticate, requireRole('admin'), c.deleteUser);

module.exports = router;
