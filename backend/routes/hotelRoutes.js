const express = require('express');
const router = express.Router();
const {
  searchHotels,
  getDestinations,
  getHotelById,
  bookHotel,
  getHotelBookingById,
  cancelHotelBooking
} = require('../controllers/hotelController');
const { authRequired, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', searchHotels);
router.get('/search', searchHotels);
router.get('/destinations', getDestinations);
router.get('/booking/:bookingId', getHotelBookingById);
router.get('/:id', getHotelById);

// Optional authentication for booking, required for cancellation
router.post('/book', optionalAuth, bookHotel);
router.post('/cancel/:bookingId', authRequired, cancelHotelBooking);

module.exports = router;
