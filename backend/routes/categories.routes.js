// routes/categories.routes.js
const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const categoriesController = require('../controllers/categories.controller.js');

router.get('/', authenticate, categoriesController.getCategories);
router.post('/', authenticate, requireRole('admin'), categoriesController.createCategory);
router.delete('/:id', authenticate, requireRole('admin'), categoriesController.deleteCategory);

module.exports = router;