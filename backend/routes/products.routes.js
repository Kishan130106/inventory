// routes/products.routes.js
const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const c = require('../controllers/products.controller');

router.get('/', authenticate, c.getProducts);
router.get('/low-stock', authenticate, c.getLowStock);
router.get('/:id', authenticate, c.getProductById);
router.post('/', authenticate, requireRole('admin', 'manager'), c.createProduct);
router.put('/:id', authenticate, requireRole('admin', 'manager'), c.updateProduct);
router.delete('/:id', authenticate, requireRole('admin'), c.deleteProduct);

module.exports = router;
