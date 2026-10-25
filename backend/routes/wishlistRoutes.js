const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authRequired, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, wishlistController.getMyWishlist);
router.post('/toggle', authRequired, wishlistController.toggleWishlist);
router.delete('/:id', authRequired, wishlistController.removeFromWishlist);

module.exports = router;
