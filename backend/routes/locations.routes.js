// routes/locations.routes.js
const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const c = require('../controllers/locations.controller');

router.get('/', authenticate, c.getLocations);
router.get('/:id', authenticate, c.getLocationById);
router.post('/', authenticate, requireRole('admin'), c.createLocation);
router.put('/:id', authenticate, requireRole('admin'), c.updateLocation);
router.delete('/:id', authenticate, requireRole('admin'), c.deleteLocation);

module.exports = router;
