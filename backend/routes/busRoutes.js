const express = require('express');
const router = express.Router();
const {
  searchBuses,
  getCities,
  getBusById,
  bookBus,
  getBusBookingById,
  cancelBusBooking
} = require('../controllers/busController');
const { authRequired, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', searchBuses);
router.get('/search', searchBuses);
router.get('/cities', getCities);
router.get('/booking/:bookingId', getBusBookingById);
router.get('/:id', getBusById);

// Optional authentication for booking, required for cancellation
router.post('/book', optionalAuth, bookBus);
router.post('/cancel/:bookingId', authRequired, cancelBusBooking);

module.exports = router;
