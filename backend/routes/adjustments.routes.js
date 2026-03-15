// routes/adjustments.routes.js
const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const c = require('../controllers/adjustments.controller');

router.get('/', authenticate, c.getAdjustments);
router.post('/', authenticate, requireRole('admin', 'manager'), c.createAdjustment);

module.exports = router;
