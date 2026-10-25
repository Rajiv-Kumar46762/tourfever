const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

router.get('/active', couponController.getActiveCoupons);
router.post('/validate', couponController.validateCoupon);

module.exports = router;
