const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const inquiryRoutes = require('./routes/inquiryRoutes');
const authRoutes = require('./routes/authRoutes');
const flightRoutes = require('./routes/flightRoutes');
const trainRoutes = require('./routes/trainRoutes');
const busRoutes = require('./routes/busRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const packageRoutes = require('./routes/packageRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');

const User = require('./models/User');
const Inquiry = require('./models/Inquiry');
const FlightBooking = require('./models/FlightBooking');
const TrainBooking = require('./models/TrainBooking');
const BusBooking = require('./models/BusBooking');
const HotelBooking = require('./models/HotelBooking');
const PackageBooking = require('./models/PackageBooking');
const Payment = require('./models/Payment');
const Wishlist = require('./models/Wishlist');
const { optionalAuth } = require('./middleware/authMiddleware');
const { seedDatabase } = require('./seedData');

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);

// Dashboard data endpoint with user-scoped database entities (account specific)
app.get('/api/dashboard', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? (req.user.userId || req.user._id) : null;
    let userEmail = (req.user?.email || req.query.email || '').trim().toLowerCase();
    let userPhone = (req.user?.phone || req.query.phone || '').trim();

    // If userId is present but email is not yet available, fetch user doc
    if (userId && !userEmail) {
      try {
        const userDoc = await User.findById(userId).lean();
        if (userDoc) {
          userEmail = (userDoc.email || '').trim().toLowerCase();
          if (!userPhone) userPhone = (userDoc.phone || '').trim();
        }
      } catch (e) {}
    }

    // Unauthenticated guest with no account context and no search query
    if (!userId && !userEmail && !userPhone) {
      return res.json({
        success: true,
        isGuest: true,
        user: null,
        stats: {
          totalSpent: 0,
          confirmedBookingsCount: 0,
          totalInquiries: 0,
          rewardPoints: 0,
          savedWishlistCount: 0,
        },
        bookings: [],
        packageBookings: [],
        trainBookings: [],
        inquiries: [],
        payments: [],
        wishlist: []
      });
    }

    // Construct match filters strictly scoped to this user
    const orUserPkg = [];
    const orUserTrn = [];
    const orUserFlt = [];
    const orUserBus = [];
    const orUserHtl = [];
    const orUserInq = [];
    const orUserPay = [];

    if (userId) {
      orUserPkg.push({ userId });
      orUserTrn.push({ userId });
      orUserFlt.push({ userId });
      orUserBus.push({ userId });
      orUserHtl.push({ userId });
      orUserInq.push({ userId });
      orUserPay.push({ userId });
    }

    if (userEmail) {
      const emailRegex = new RegExp(`^${userEmail}$`, 'i');
      orUserPkg.push({ 'primaryContact.email': emailRegex });
      orUserTrn.push({ 'contactDetails.email': emailRegex });
      orUserFlt.push({ 'contactDetails.email': emailRegex });
      orUserBus.push({ 'contactDetails.email': emailRegex });
      orUserHtl.push({ 'primaryContact.email': emailRegex });
      orUserInq.push({ userEmail: emailRegex });
    }

    if (userPhone) {
      orUserPkg.push({ 'primaryContact.phone': userPhone });
      orUserTrn.push({ 'contactDetails.phone': userPhone });
      orUserFlt.push({ 'contactDetails.phone': userPhone });
      orUserBus.push({ 'contactDetails.phone': userPhone });
      orUserHtl.push({ 'primaryContact.phone': userPhone });
      orUserInq.push({ phone: userPhone });
    }

    const confirmedPackages = orUserPkg.length > 0
      ? await PackageBooking.find({ status: 'CONFIRMED', $or: orUserPkg }).sort({ createdAt: -1 })
      : [];

    const confirmedTrains = orUserTrn.length > 0
      ? await TrainBooking.find({ status: 'CONFIRMED', $or: orUserTrn }).sort({ createdAt: -1 })
      : [];

    const confirmedFlights = orUserFlt.length > 0
      ? await FlightBooking.find({ status: 'CONFIRMED', $or: orUserFlt }).sort({ createdAt: -1 })
      : [];

    const confirmedBuses = orUserBus.length > 0
      ? await BusBooking.find({ status: 'CONFIRMED', $or: orUserBus }).sort({ createdAt: -1 })
      : [];

    const confirmedHotels = orUserHtl.length > 0
      ? await HotelBooking.find({ status: 'CONFIRMED', $or: orUserHtl }).sort({ createdAt: -1 })
      : [];

    const userInquiries = orUserInq.length > 0
      ? await Inquiry.find({ $or: orUserInq }).sort({ createdAt: -1 })
      : [];

    const allConfirmedBookings = [
      ...confirmedPackages.map(b => ({ ...b.toObject(), bookingType: 'PACKAGE' })),
      ...confirmedTrains.map(b => ({ ...b.toObject(), bookingType: 'TRAIN' })),
      ...confirmedFlights.map(b => ({ ...b.toObject(), bookingType: 'FLIGHT' })),
      ...confirmedBuses.map(b => ({ ...b.toObject(), bookingType: 'BUS' })),
      ...confirmedHotels.map(b => ({ ...b.toObject(), bookingType: 'HOTEL' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const userBookingIds = allConfirmedBookings.map(b => b.bookingId).filter(Boolean);
    if (userBookingIds.length > 0) {
      orUserPay.push({ bookingId: { $in: userBookingIds } });
    }

    const userPayments = orUserPay.length > 0
      ? await Payment.find({ $or: orUserPay }).sort({ createdAt: -1 }).limit(20)
      : [];

    const userWishlist = userId
      ? await Wishlist.find({ userId }).sort({ createdAt: -1 })
      : [];

    const totalSpent = allConfirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const confirmedBookingsCount = allConfirmedBookings.length;
    const totalInquiries = userInquiries.length;
    const rewardPoints = Math.floor(totalSpent / 50);

    res.json({
      success: true,
      isGuest: false,
      userId,
      userEmail,
      stats: {
        totalSpent,
        confirmedBookingsCount,
        totalInquiries,
        rewardPoints,
        savedWishlistCount: userWishlist.length,
      },
      bookings: allConfirmedBookings,
      packageBookings: confirmedPackages,
      trainBookings: confirmedTrains,
      inquiries: userInquiries,
      payments: userPayments,
      wishlist: userWishlist
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
      stats: {
        totalSpent: 0,
        confirmedBookingsCount: 0,
        totalInquiries: 0,
        rewardPoints: 0
      },
      bookings: [],
      packageBookings: [],
      trainBookings: [],
      inquiries: [],
      payments: []
    });
  }
});

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: "Tour Fever Complete Travel Booking API is online.",
    services: ["/api/flights", "/api/trains", "/api/buses", "/api/hotels", "/api/packages", "/api/bookings", "/api/payments"]
  });
});

async function startServer() {
  let uri = process.env.MONGO_URI;
  let connected = false;

  // 1. Try configured MONGO_URI
  if (uri) {
    try {
      console.log('Attempting connection to MONGO_URI...');
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
      });
      connected = true;
      console.log('✓ Connected to configured MongoDB');
    } catch (e) {
      console.warn('Configured MONGO_URI unavailable:', e.message);
    }
  }

  // In production, do not fall back to local/in-memory database
  if (!connected && process.env.NODE_ENV === 'production') {
    console.error('❌ Fatal: Could not connect to MongoDB Atlas in production. Please check MONGO_URI and Atlas Network Access (allow 0.0.0.0/0).');
    process.exit(1);
  }

  // 2. Try localhost default
  if (!connected) {
    try {
      console.log('Attempting connection to local MongoDB (mongodb://127.0.0.1:27017/tourfever)...');
      await mongoose.connect('mongodb://127.0.0.1:27017/tourfever', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 2000
      });
      connected = true;
      console.log('✓ Connected to local MongoDB on port 27017');
    } catch (e) {
      console.log('Local MongoDB not running. Initializing embedded database engine...');
    }
  }

  // 3. Fallback: Embedded MongoMemoryServer
  if (!connected) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri() + 'tourfever';
      await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      connected = true;
      console.log(`✓ Embedded MongoDB Engine active at ${uri}`);
    } catch (err) {
      console.error('Fatal: Could not initialize database engine:', err);
      process.exit(1);
    }
  }

  // Run database seeder
  await seedDatabase();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✨ Tour Fever server running on http://localhost:${PORT}`);
    console.log(`📡 Services available: Flights, Trains, Buses, Hotels, Packages, Payments, Dashboard`);
  });
}

startServer();
