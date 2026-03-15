// routes/deliveries.routes.js
const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const c = require('../controllers/deliveries.controller');

router.get('/', authenticate, c.getDeliveries);
router.get('/:id', authenticate, c.getDeliveryById);
router.post('/', authenticate, c.createDelivery);
router.post('/:id/validate', authenticate, requireRole('admin', 'manager'), c.validateDelivery);
router.patch('/:id/cancel', authenticate, requireRole('admin', 'manager'), c.cancelDelivery);

module.exports = router;
