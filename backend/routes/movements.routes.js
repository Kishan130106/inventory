// routes/movements.routes.js
const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { getMovements } = require('../controllers/movements.controller');

// Read-only — all authenticated users can view the ledger
router.get('/', authenticate, getMovements);

module.exports = router;
