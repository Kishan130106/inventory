const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authCtrl = require('../controllers/authController');
const productCtrl = require('../controllers/productController');
const receiptCtrl = require('../controllers/receiptController');
const deliveryCtrl = require('../controllers/deliveryController');
const invCtrl = require('../controllers/inventoryController');

// ── AUTH ──────────────────────────────────────────────────
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', auth, authCtrl.getMe);
router.post('/auth/send-otp', authCtrl.sendOtp);
router.post('/auth/reset-password', authCtrl.resetPassword);

// ── DASHBOARD ─────────────────────────────────────────────
router.get('/dashboard', auth, invCtrl.getDashboard);

// ── PRODUCTS ──────────────────────────────────────────────
router.get('/products', auth, productCtrl.getAll);
router.get('/products/categories', auth, productCtrl.getCategories);
router.get('/products/:id', auth, productCtrl.getById);
router.post('/products', auth, productCtrl.create);
router.put('/products/:id', auth, productCtrl.update);
router.delete('/products/:id', auth, productCtrl.remove);

// ── RECEIPTS ──────────────────────────────────────────────
router.get('/receipts', auth, receiptCtrl.getAll);
router.get('/receipts/:id', auth, receiptCtrl.getById);
router.post('/receipts', auth, receiptCtrl.create);
router.put('/receipts/:id', auth, receiptCtrl.update);
router.patch('/receipts/:id/status', auth, receiptCtrl.updateStatus);

// ── DELIVERIES ────────────────────────────────────────────
router.get('/deliveries', auth, deliveryCtrl.getAll);
router.get('/deliveries/:id', auth, deliveryCtrl.getById);
router.post('/deliveries', auth, deliveryCtrl.create);
router.put('/deliveries/:id', auth, deliveryCtrl.update);
router.patch('/deliveries/:id/status', auth, deliveryCtrl.updateStatus);

// ── INTERNAL TRANSFERS ────────────────────────────────────
router.get('/transfers', auth, invCtrl.getTransfers);
router.get('/transfers/:id', auth, invCtrl.getTransferById);
router.post('/transfers', auth, invCtrl.createTransfer);
router.patch('/transfers/:id/validate', auth, invCtrl.validateTransfer);

// ── STOCK ADJUSTMENTS ─────────────────────────────────────
router.get('/adjustments', auth, invCtrl.getAdjustments);
router.post('/adjustments', auth, invCtrl.createAdjustment);

// ── MOVE HISTORY ──────────────────────────────────────────
router.get('/move-history', auth, invCtrl.getMoveHistory);

// ── WAREHOUSES & LOCATIONS ────────────────────────────────
router.get('/warehouses', auth, invCtrl.getWarehouses);
router.post('/warehouses', auth, invCtrl.createWarehouse);
router.get('/locations', auth, invCtrl.getLocations);
router.post('/locations', auth, invCtrl.createLocation);

module.exports = router;
