const express = require('express');
const router = express.Router();
const {
  getMyBookings,
  getBookingTicket,
  cancelBookingUnified
} = require('../controllers/bookingController');
const { authRequired, optionalAuth } = require('../middleware/authMiddleware');

// Get bookings for the authenticated user or search by contact email/phone
router.get('/', optionalAuth, getMyBookings);
router.get('/my-bookings', optionalAuth, getMyBookings);
router.get('/my', optionalAuth, getMyBookings);
router.get('/ticket/:type/:bookingId', optionalAuth, getBookingTicket);
router.post('/cancel', optionalAuth, cancelBookingUnified);

module.exports = router;
