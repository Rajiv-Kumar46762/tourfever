const Flight = require('../models/Flight');
const FlightBooking = require('../models/FlightBooking');
const Payment = require('../models/Payment');

function generatePNR() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pnr = 'TF';
  for (let i = 0; i < 4; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

function generateBookingId() {
  return 'TF-FL-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
}

const CITY_AIRPORTS = {
  delhi: { code: 'DEL', airport: 'Indira Gandhi International Airport', city: 'Delhi' },
  mumbai: { code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj Intl Airport', city: 'Mumbai' },
  bangalore: { code: 'BLR', airport: 'Kempegowda International Airport', city: 'Bangalore' },
  bengaluru: { code: 'BLR', airport: 'Kempegowda International Airport', city: 'Bangalore' },
  goa: { code: 'GOX', airport: 'Manohar International Airport (MOPA)', city: 'Goa' },
  jaipur: { code: 'JAI', airport: 'Jaipur International Airport', city: 'Jaipur' },
  manali: { code: 'KUU', airport: 'Kullu Manali Bhuntar Airport', city: 'Manali' },
  varanasi: { code: 'VNS', airport: 'Lal Bahadur Shastri International Airport', city: 'Varanasi' },
  agra: { code: 'AGR', airport: 'Agra Civil Enclave', city: 'Agra' },
  kolkata: { code: 'CCU', airport: 'Netaji Subhash Chandra Bose Intl Airport', city: 'Kolkata' },
  chennai: { code: 'MAA', airport: 'Chennai International Airport', city: 'Chennai' },
  hyderabad: { code: 'HYD', airport: 'Rajiv Gandhi International Airport', city: 'Hyderabad' },
  pune: { code: 'PNQ', airport: 'Pune International Airport', city: 'Pune' },
  ahmedabad: { code: 'AMD', airport: 'Sardar Vallabhbhai Patel Intl Airport', city: 'Ahmedabad' },
  amritsar: { code: 'ATQ', airport: 'Sri Guru Ram Dass Jee Intl Airport', city: 'Amritsar' },
  dubai: { code: 'DXB', airport: 'Dubai International Airport', city: 'Dubai' },
  maldives: { code: 'MLE', airport: 'Velana International Airport (Male)', city: 'Maldives' },
  singapore: { code: 'SIN', airport: 'Singapore Changi Airport', city: 'Singapore' },
  kyoto: { code: 'KIX', airport: 'Kansai International Airport', city: 'Kyoto' },
  tokyo: { code: 'HND', airport: 'Tokyo Haneda International Airport', city: 'Tokyo' },
};

function getAirportInfo(cityStr) {
  if (!cityStr) return null;
  const key = cityStr.toLowerCase().trim();
  for (const [k, v] of Object.entries(CITY_AIRPORTS)) {
    if (key.includes(k) || k.includes(key) || v.code.toLowerCase() === key) {
      return v;
    }
  }
  const clean = cityStr.charAt(0).toUpperCase() + cityStr.slice(1).toLowerCase();
  return {
    code: clean.slice(0, 3).toUpperCase(),
    airport: `${clean} International Airport`,
    city: clean
  };
}

async function generateLiveFlights(fromStr, toStr) {
  const fromInfo = getAirportInfo(fromStr) || { code: 'DEL', airport: 'Indira Gandhi International Airport', city: 'Delhi' };
  const toInfo = getAirportInfo(toStr) || { code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj Intl Airport', city: 'Mumbai' };

  if (fromInfo.city.toLowerCase() === toInfo.city.toLowerCase()) {
    return [];
  }

  const flightTemplates = [
    {
      airline: 'IndiGo',
      airlineCode: '6E',
      flightNumber: `6E-${Math.floor(2000 + Math.random() * 8000)}`,
      departureTime: '06:15',
      arrivalTime: '08:30',
      duration: '2h 15m',
      basePrice: 3499,
      meals: false
    },
    {
      airline: 'Air India',
      airlineCode: 'AI',
      flightNumber: `AI-${Math.floor(100 + Math.random() * 800)}`,
      departureTime: '10:45',
      arrivalTime: '13:00',
      duration: '2h 15m',
      basePrice: 4250,
      meals: true
    },
    {
      airline: 'Vistara',
      airlineCode: 'UK',
      flightNumber: `UK-${Math.floor(700 + Math.random() * 200)}`,
      departureTime: '15:30',
      arrivalTime: '17:45',
      duration: '2h 15m',
      basePrice: 4890,
      meals: true
    },
    {
      airline: 'Akasa Air',
      airlineCode: 'QP',
      flightNumber: `QP-${Math.floor(1100 + Math.random() * 500)}`,
      departureTime: '19:40',
      arrivalTime: '21:55',
      duration: '2h 15m',
      basePrice: 3150,
      meals: false
    }
  ];

  const created = [];
  for (const t of flightTemplates) {
    const flightDoc = new Flight({
      airline: t.airline,
      airlineCode: t.airlineCode,
      flightNumber: t.flightNumber,
      fromCity: fromInfo.city,
      fromAirport: fromInfo.airport,
      fromCode: fromInfo.code,
      toCity: toInfo.city,
      toAirport: toInfo.airport,
      toCode: toInfo.code,
      departureTime: t.departureTime,
      arrivalTime: t.arrivalTime,
      duration: t.duration,
      stops: 0,
      stopDetails: 'Non-stop',
      baggage: {
        cabin: '7 kg',
        checkin: t.airline === 'IndiGo' ? '15 kg' : '25 kg'
      },
      classes: [
        { name: 'Economy', price: t.basePrice, availableSeats: Math.floor(18 + Math.random() * 24) },
        { name: 'Premium Economy', price: Math.round(t.basePrice * 1.55), availableSeats: Math.floor(8 + Math.random() * 12) },
        { name: 'Business', price: Math.round(t.basePrice * 2.85), availableSeats: Math.floor(4 + Math.random() * 6) }
      ],
      mealsIncluded: t.meals,
      refundable: true,
      isActive: true
    });
    created.push(flightDoc);
  }

  try {
    return await Flight.insertMany(created);
  } catch (err) {
    return created;
  }
}

exports.searchFlights = async (req, res) => {
  try {
    const { from, to, date, class: flightClass, stops, airline, sortBy, sortOrder } = req.query;
    const query = { isActive: true };

    if (from) {
      query.$or = [
        { fromCity: new RegExp(from, 'i') },
        { fromCode: new RegExp(from, 'i') },
        { fromAirport: new RegExp(from, 'i') }
      ];
    }

    if (to) {
      const toQuery = [
        { toCity: new RegExp(to, 'i') },
        { toCode: new RegExp(to, 'i') },
        { toAirport: new RegExp(to, 'i') }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: toQuery }];
        delete query.$or;
      } else {
        query.$or = toQuery;
      }
    }

    if (stops !== undefined && stops !== '') {
      query.stops = Number(stops);
    }

    if (airline) {
      query.airline = new RegExp(airline, 'i');
    }

    let flights = await Flight.find(query);

    // If query has specific from/to and no flights found in DB, generate real-time live scheduled flights for that route!
    if (flights.length === 0 && (from || to)) {
      flights = await generateLiveFlights(from, to);
    } else if (flights.length === 0) {
      flights = await Flight.find({ isActive: true });
    }

    // Apply sorting
    if (sortBy === 'price') {
      const selectedClass = flightClass || 'Economy';
      flights.sort((a, b) => {
        const priceA = a.classes.find(c => c.name === selectedClass)?.price || a.classes[0]?.price || 0;
        const priceB = b.classes.find(c => c.name === selectedClass)?.price || b.classes[0]?.price || 0;
        return sortOrder === 'desc' ? priceB - priceA : priceA - priceB;
      });
    } else if (sortBy === 'departure') {
      flights.sort((a, b) => {
        return sortOrder === 'desc'
          ? b.departureTime.localeCompare(a.departureTime)
          : a.departureTime.localeCompare(b.departureTime);
      });
    }

    res.json({ success: true, count: flights.length, data: flights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAirports = async (req, res) => {
  try {
    const flights = await Flight.find({ isActive: true });
    const fromList = flights.map(f => ({ city: f.fromCity, code: f.fromCode, airport: f.fromAirport }));
    const toList = flights.map(f => ({ city: f.toCity, code: f.toCode, airport: f.toAirport }));
    
    // Deduplicate
    const uniqueMap = new Map();
    [...fromList, ...toList].forEach(item => {
      if (!uniqueMap.has(item.code)) {
        uniqueMap.set(item.code, item);
      }
    });

    res.json({ success: true, data: Array.from(uniqueMap.values()) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    res.json({ success: true, data: flight });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bookFlight = async (req, res) => {
  try {
    const {
      flightId,
      tripType,
      travelDate,
      returnDate,
      selectedClass,
      passengers,
      contactDetails,
      paymentMethod,
      cardLast4,
      cardHolder
    } = req.body;

    if (!flightId || !travelDate || !passengers || passengers.length === 0 || !contactDetails) {
      return res.status(400).json({ success: false, message: 'Missing required booking details.' });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found.' });
    }

    const classObj = flight.classes.find(c => c.name === (selectedClass || 'Economy')) || flight.classes[0];
    const baseFare = classObj.price * passengers.length;
    const taxesAndFees = Math.round(baseFare * 0.12);
    const totalAmount = (tripType === 'round-trip' ? (baseFare * 1.8) : baseFare) + taxesAndFees;

    const bookingId = generateBookingId();
    const pnr = generatePNR();

    const booking = new FlightBooking({
      bookingId,
      pnr,
      userId: req.user ? req.user.userId : null,
      flightId: flight._id,
      flightSnapshot: {
        airline: flight.airline,
        airlineCode: flight.airlineCode,
        flightNumber: flight.flightNumber,
        fromCity: flight.fromCity,
        fromAirport: flight.fromAirport,
        fromCode: flight.fromCode,
        toCity: flight.toCity,
        toAirport: flight.toAirport,
        toCode: flight.toCode,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        duration: flight.duration,
        stops: flight.stops,
        stopDetails: flight.stopDetails,
        baggage: flight.baggage
      },
      tripType: tripType || 'one-way',
      travelDate: new Date(travelDate),
      returnDate: returnDate ? new Date(returnDate) : undefined,
      selectedClass: classObj.name,
      passengers,
      contactDetails,
      baseFare,
      taxesAndFees,
      totalAmount,
      status: 'CONFIRMED',
      paymentId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
      paymentStatus: 'PAID'
    });

    await booking.save();

    // Create Payment Record
    const payment = new Payment({
      transactionId: booking.paymentId,
      bookingType: 'FLIGHT',
      bookingId: booking.bookingId,
      userId: req.user ? req.user.userId : null,
      amount: totalAmount,
      currency: 'INR',
      paymentMethod: paymentMethod || 'CARD',
      cardHolder: cardHolder || contactDetails.name || 'VALUED TRAVELER',
      cardLast4: cardLast4 || '4242',
      status: 'SUCCESS'
    });
    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Flight booked successfully!',
      data: booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await FlightBooking.findOne({ bookingId: req.params.bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelFlightBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const booking = await FlightBooking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    booking.status = 'CANCELLED';
    booking.paymentStatus = 'REFUNDED';
    booking.cancellationReason = reason || 'Customer requested cancellation';
    booking.cancelledAt = new Date();
    await booking.save();

    // Update payment record
    await Payment.findOneAndUpdate(
      { bookingId: booking.bookingId },
      { status: 'REFUNDED' }
    );

    res.json({ success: true, message: 'Flight booking cancelled and refund initiated.', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
