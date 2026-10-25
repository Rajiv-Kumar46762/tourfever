const express = require('express');
const router = express.Router();
const { bookPackage, getPackageBookingById, cancelPackageBooking } = require('../controllers/packageController');
const { authRequired, optionalAuth } = require('../middleware/authMiddleware');

const signaturePackages = [
  {
    id: 'pkg-1',
    title: 'Maldives Luxury Lagoon & Water Villa',
    destination: 'Maldives',
    duration: '5 Days / 4 Nights',
    price: 1290,
    image: '/images/packege-1.jpg',
    rating: 4.9,
    reviews: 142
  },
  {
    id: 'pkg-2',
    title: 'Swiss Alps & Glacier Express Grand Tour',
    destination: 'Switzerland (Zurich, Zermatt, St. Moritz)',
    duration: '7 Days / 6 Nights',
    price: 2150,
    image: '/images/packege-2.jpg',
    rating: 5.0,
    reviews: 98
  },
  {
    id: 'pkg-3',
    title: 'Kyoto Zen Temples & Heritage Discovery',
    destination: 'Kyoto & Tokyo, Japan',
    duration: '6 Days / 5 Nights',
    price: 1680,
    image: '/images/packege-3.jpg',
    rating: 4.8,
    reviews: 110
  },
  {
    id: 'pkg-4',
    title: 'Dubai Marina Luxury & Desert Glamping',
    destination: 'Dubai, UAE',
    duration: '5 Days / 4 Nights',
    price: 940,
    image: '/images/popular-3.jpg',
    rating: 4.9,
    reviews: 84
  }
];

router.get('/', (req, res) => {
  res.json({ success: true, count: signaturePackages.length, data: signaturePackages });
});

router.post('/book', optionalAuth, bookPackage);
router.get('/booking/:bookingId', optionalAuth, getPackageBookingById);
router.post('/cancel/:bookingId', authRequired, cancelPackageBooking);

module.exports = router;
