// routes/dashboard.routes.js
const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { getStats } = require('../controllers/dashboard.controller');

router.get('/', authenticate, getStats);

module.exports = router;
