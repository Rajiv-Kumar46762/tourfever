const express = require('express');
const router = express.Router();
const {
  searchFlights,
  getAirports,
  getFlightById,
  bookFlight,
  getBookingById,
  cancelFlightBooking
} = require('../controllers/flightController');
const { authRequired, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', searchFlights);
router.get('/search', searchFlights);
router.get('/airports', getAirports);
router.get('/booking/:bookingId', getBookingById);
router.get('/:id', getFlightById);

// Optional authentication for booking, required for cancellation
router.post('/book', optionalAuth, bookFlight);
router.post('/cancel/:bookingId', authRequired, cancelFlightBooking);

module.exports = router;
