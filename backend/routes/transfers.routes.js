// routes/transfers.routes.js
const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const c = require('../controllers/transfers.controller');

router.get('/', authenticate, c.getTransfers);
router.get('/:id', authenticate, c.getTransferById);
router.post('/', authenticate, c.createTransfer);
router.post('/:id/validate', authenticate, requireRole('admin', 'manager'), c.validateTransfer);
router.patch('/:id/cancel', authenticate, requireRole('admin', 'manager'), c.cancelTransfer);

module.exports = router;
