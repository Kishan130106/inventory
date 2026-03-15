// routes/receipts.routes.js
const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const c = require('../controllers/receipts.controller');

router.get('/', authenticate, c.getReceipts);
router.get('/:id', authenticate, c.getReceiptById);
router.post('/', authenticate, c.createReceipt);
router.post('/:id/validate', authenticate, requireRole('admin', 'manager'), c.validateReceipt);
router.patch('/:id/cancel', authenticate, requireRole('admin', 'manager'), c.cancelReceipt);

module.exports = router;
