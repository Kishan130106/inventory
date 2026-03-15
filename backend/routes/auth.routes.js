// routes/auth.routes.js
const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { googleLogin, requestOTP, verifyOTP, getMe } = require('../controllers/auth.controller');

router.post('/google', googleLogin);
router.post('/otp/request', requestOTP);
router.post('/otp/verify', verifyOTP);
router.get('/me', authenticate, getMe);

module.exports = router;
