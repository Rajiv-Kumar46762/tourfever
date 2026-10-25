const express = require('express');
const router = express.Router();
const { processPayment, getPaymentHistory } = require('../controllers/paymentController');
const { authRequired, optionalAuth } = require('../middleware/authMiddleware');

router.post('/process', optionalAuth, processPayment);
router.get('/history', authRequired, getPaymentHistory);

module.exports = router;

