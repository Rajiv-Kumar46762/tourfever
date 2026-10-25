const express = require('express');
const router = express.Router();
const {
  searchTrains,
  getStations,
  getTrainById,
  bookTrain,
  getTrainBookingById,
  cancelTrainBooking
} = require('../controllers/trainController');
const { authRequired, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', searchTrains);
router.get('/search', searchTrains);
router.get('/stations', getStations);
router.get('/booking/:bookingId', getTrainBookingById);
router.get('/:id', getTrainById);

// Optional authentication for booking, required for cancellation
router.post('/book', optionalAuth, bookTrain);
router.post('/cancel/:bookingId', authRequired, cancelTrainBooking);

module.exports = router;
