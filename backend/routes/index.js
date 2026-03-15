// routes/index.js — Master router, mounts all sub-routers
const router = require('express').Router();

router.use('/auth',        require('./auth.routes'));
router.use('/products',    require('./products.routes'));
router.use('/categories',  require('./categories.routes'));
router.use('/locations',   require('./locations.routes'));
router.use('/receipts',    require('./receipts.routes'));
router.use('/deliveries',  require('./deliveries.routes'));
router.use('/transfers',   require('./transfers.routes'));
router.use('/adjustments', require('./adjustments.routes'));
router.use('/movements',   require('./movements.routes'));
router.use('/dashboard',   require('./dashboard.routes'));
router.use('/users',       require('./users.routes'));

module.exports = router;
