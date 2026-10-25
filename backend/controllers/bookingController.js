const FlightBooking = require('../models/FlightBooking');
const TrainBooking = require('../models/TrainBooking');
const BusBooking = require('../models/BusBooking');
const HotelBooking = require('../models/HotelBooking');
const PackageBooking = require('../models/PackageBooking');
const Payment = require('../models/Payment');

exports.getMyBookings = async (req, res) => {
  try {
    const { email, phone, type, status } = req.query;
    const userId = req.user ? (req.user.userId || req.user._id) : null;
    let userEmail = (email || req.user?.email || '').trim().toLowerCase();
    let userPhone = (phone || req.user?.phone || '').trim();

    if (userId && !userEmail) {
      try {
        const User = require('../models/User');
        const userDoc = await User.findById(userId).lean();
        if (userDoc) {
          userEmail = (userDoc.email || '').trim().toLowerCase();
          if (!userPhone) userPhone = (userDoc.phone || '').trim();
        }
      } catch (e) {}
    }

    // If neither authenticated nor searching with email/phone, return empty list
    if (!userId && !userEmail && !userPhone) {
      return res.json({
        success: true,
        count: 0,
        stats: {
          totalBookings: 0,
          flightsCount: 0,
          trainsCount: 0,
          busesCount: 0,
          hotelsCount: 0,
          packagesCount: 0,
          activeCount: 0,
          cancelledCount: 0,
          totalSpent: 0
        },
        bookings: [],
        data: []
      });
    }

    // Construct search filter
    const orConditions = [];
    if (userId) {
      orConditions.push({ userId });
    }
    if (userEmail) {
      const emailRegex = new RegExp(`^${userEmail}$`, 'i');
      orConditions.push({ 'contactDetails.email': emailRegex });
      orConditions.push({ 'primaryContact.email': emailRegex });
    }
    if (userPhone) {
      orConditions.push({ 'contactDetails.phone': userPhone });
      orConditions.push({ 'primaryContact.phone': userPhone });
    }

    const userQuery = { $or: orConditions };

    let flightBookings = [];
    let trainBookings = [];
    let busBookings = [];
    let hotelBookings = [];
    let packageBookings = [];

    // Fetch by type or all
    if (!type || type === 'all' || type === 'flight') {
      flightBookings = await FlightBooking.find(userQuery).sort({ createdAt: -1 });
    }
    if (!type || type === 'all' || type === 'train') {
      trainBookings = await TrainBooking.find(userQuery).sort({ createdAt: -1 });
    }
    if (!type || type === 'all' || type === 'bus') {
      busBookings = await BusBooking.find(userQuery).sort({ createdAt: -1 });
    }
    if (!type || type === 'all' || type === 'hotel') {
      hotelBookings = await HotelBooking.find(userQuery).sort({ createdAt: -1 });
    }
    if (!type || type === 'all' || type === 'package') {
      packageBookings = await PackageBooking.find(userQuery).sort({ createdAt: -1 });
    }

    // Normalize unified format
    const unified = [
      ...flightBookings.map(b => ({
        type: 'flight',
        typeName: 'Flight',
        typeIcon: 'airplane-outline',
        id: b._id,
        bookingId: b.bookingId,
        referenceNumber: b.pnr,
        title: `${b.flightSnapshot.airline} (${b.flightSnapshot.flightNumber})`,
        subtitle: `${b.flightSnapshot.fromCity} (${b.flightSnapshot.fromCode}) → ${b.flightSnapshot.toCity} (${b.flightSnapshot.toCode})`,
        date: b.travelDate,
        returnDate: b.returnDate,
        amount: b.totalAmount,
        status: b.status,
        paymentStatus: b.paymentStatus,
        details: b,
        createdAt: b.createdAt
      })),
      ...trainBookings.map(b => ({
        type: 'train',
        typeName: 'Train',
        typeIcon: 'train-outline',
        id: b._id,
        bookingId: b.bookingId,
        referenceNumber: b.pnr,
        title: `${b.trainSnapshot.trainNumber} - ${b.trainSnapshot.trainName}`,
        subtitle: `${b.trainSnapshot.fromCity} (${b.trainSnapshot.fromCode}) → ${b.trainSnapshot.toCity} (${b.trainSnapshot.toCode}) [${b.selectedClass}]`,
        date: b.journeyDate,
        amount: b.totalAmount,
        status: b.status,
        paymentStatus: b.paymentStatus,
        details: b,
        createdAt: b.createdAt
      })),
      ...busBookings.map(b => ({
        type: 'bus',
        typeName: 'Bus',
        typeIcon: 'bus-outline',
        id: b._id,
        bookingId: b.bookingId,
        referenceNumber: b.ticketNumber,
        title: b.busSnapshot.operatorName,
        subtitle: `${b.busSnapshot.fromCity} → ${b.busSnapshot.toCity} [Seats: ${b.selectedSeats.join(', ')}]`,
        date: b.travelDate,
        amount: b.totalAmount,
        status: b.status,
        paymentStatus: b.paymentStatus,
        details: b,
        createdAt: b.createdAt
      })),
      ...hotelBookings.map(b => ({
        type: 'hotel',
        typeName: 'Hotel',
        typeIcon: 'bed-outline',
        id: b._id,
        bookingId: b.bookingId,
        referenceNumber: b.confirmationCode,
        title: b.hotelSnapshot.name,
        subtitle: `${b.hotelSnapshot.city} • ${b.roomType} (${b.nights} night${b.nights > 1 ? 's' : ''})`,
        date: b.checkInDate,
        checkOutDate: b.checkOutDate,
        amount: b.totalAmount,
        status: b.status,
        paymentStatus: b.paymentStatus,
        details: b,
        createdAt: b.createdAt
      })),
      ...packageBookings.map(b => ({
        type: 'package',
        typeName: 'Holiday Package',
        typeIcon: 'earth-outline',
        id: b._id,
        bookingId: b.bookingId,
        referenceNumber: b.referenceNumber,
        title: b.packageTitle,
        subtitle: `${b.destination} • ${b.duration} (${b.paxCount} Guest${b.paxCount > 1 ? 's' : ''})`,
        date: b.travelDate,
        amount: b.totalAmount,
        status: b.status,
        paymentStatus: b.paymentStatus,
        details: b,
        createdAt: b.createdAt
      }))
    ];

    // Filter by status if specified
    let filtered = unified;
    if (status && status !== 'all') {
      filtered = filtered.filter(item => item.status.toLowerCase() === status.toLowerCase());
    }

    // Sort by created date descending
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Compute stats
    const totalSpent = unified
      .filter(item => item.status === 'CONFIRMED')
      .reduce((sum, item) => sum + item.amount, 0);

    const stats = {
      totalBookings: unified.length,
      flightsCount: flightBookings.length,
      trainsCount: trainBookings.length,
      busesCount: busBookings.length,
      hotelsCount: hotelBookings.length,
      packagesCount: packageBookings.length,
      activeCount: unified.filter(b => b.status === 'CONFIRMED').length,
      cancelledCount: unified.filter(b => b.status === 'CANCELLED').length,
      totalSpent
    };

    res.json({ success: true, count: filtered.length, stats, bookings: filtered, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookingTicket = async (req, res) => {
  try {
    const { type, bookingId } = req.params;
    let bookingData = null;

    if (type === 'flight') {
      bookingData = await FlightBooking.findOne({ bookingId });
    } else if (type === 'train') {
      bookingData = await TrainBooking.findOne({ bookingId });
    } else if (type === 'bus') {
      bookingData = await BusBooking.findOne({ bookingId });
    } else if (type === 'hotel') {
      bookingData = await HotelBooking.findOne({ bookingId });
    } else if (type === 'package') {
      bookingData = await PackageBooking.findOne({ bookingId });
    }

    if (!bookingData) {
      return res.status(404).json({ success: false, message: 'Booking ticket not found.' });
    }

    res.json({ success: true, type, data: bookingData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelBookingUnified = async (req, res) => {
  try {
    const type = (req.body.type || req.body.bookingType || '').toLowerCase();
    const { bookingId, reason } = req.body;
    if (!type || !bookingId) {
      return res.status(400).json({ success: false, message: 'Type and Booking ID are required.' });
    }

    let booking = null;
    let modelName = '';

    if (type === 'flight') {
      booking = await FlightBooking.findOne({ bookingId });
      modelName = 'Flight';
    } else if (type === 'train') {
      booking = await TrainBooking.findOne({ bookingId });
      modelName = 'Train';
    } else if (type === 'bus') {
      booking = await BusBooking.findOne({ bookingId });
      modelName = 'Bus';
    } else if (type === 'hotel') {
      booking = await HotelBooking.findOne({ bookingId });
      modelName = 'Hotel';
    } else if (type === 'package') {
      booking = await PackageBooking.findOne({ bookingId });
      modelName = 'Holiday Package';
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: `${type.toUpperCase()} booking not found.` });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    booking.status = 'CANCELLED';
    booking.paymentStatus = 'REFUNDED';
    booking.cancellationReason = reason || 'User requested cancellation';
    booking.cancelledAt = new Date();
    await booking.save();

    // If bus booking, free up seats
    if (type === 'bus') {
      const Bus = require('../models/Bus');
      const bus = await Bus.findById(booking.busId);
      if (bus) {
        bus.seats.forEach(s => {
          if (booking.selectedSeats.includes(s.seatNumber)) {
            s.isBooked = false;
          }
        });
        await bus.save();
      }
    }

    await Payment.findOneAndUpdate(
      { bookingId: booking.bookingId },
      { status: 'REFUNDED' }
    );

    res.json({
      success: true,
      message: `${modelName} booking (${bookingId}) cancelled and refund of $${booking.totalAmount} processed successfully.`,
      data: booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
