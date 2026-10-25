const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authRequired, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, reviewController.getReviews);
router.post('/', authRequired, reviewController.addReview);

module.exports = router;
