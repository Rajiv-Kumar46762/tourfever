const Bus = require('../models/Bus');
const BusBooking = require('../models/BusBooking');
const Payment = require('../models/Payment');

function generateBusTicket() {
  return 'TF-BUS-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
}

function generateBusSeats(basePrice) {
  const seats = [];
  const lowerRows = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12'];
  const upperRows = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12'];

  lowerRows.forEach((s, idx) => {
    seats.push({
      seatNumber: s,
      deck: 'lower',
      type: idx % 3 === 0 ? 'sleeper' : 'seater',
      isBooked: idx === 1 || idx === 5,
      genderPreference: 'all',
      price: idx % 3 === 0 ? basePrice + 250 : basePrice
    });
  });

  upperRows.forEach((s, idx) => {
    seats.push({
      seatNumber: s,
      deck: 'upper',
      type: 'sleeper',
      isBooked: idx === 2 || idx === 7,
      genderPreference: 'all',
      price: basePrice + 350
    });
  });

  return seats;
}

async function generateLiveBuses(fromStr, toStr) {
  const fromCity = (fromStr || 'Delhi').trim();
  const toCity = (toStr || 'Jaipur').trim();

  if (fromCity.toLowerCase() === toCity.toLowerCase()) return [];

  const randId = Math.floor(1000 + Math.random() * 9000);
  const busTemplates = [
    {
      busNumber: `NL-01-B-${randId}`,
      operatorName: 'IntrCity SmartBus',
      busType: 'Volvo AC Multi-Axle Sleeper (2+1)',
      departureTime: '21:30',
      arrivalTime: '06:00',
      duration: '8h 30m',
      basePrice: 950,
      rating: 4.8,
      reviewsCount: 340
    },
    {
      busNumber: `DL-01-Z-${randId + 1}`,
      operatorName: 'Zingbus Electric Express',
      busType: 'Premium Electric AC Sleeper (2+1)',
      departureTime: '22:15',
      arrivalTime: '06:45',
      duration: '8h 30m',
      basePrice: 890,
      rating: 4.9,
      reviewsCount: 410
    },
    {
      busNumber: `KA-04-V-${randId + 2}`,
      operatorName: 'VRL Travels Luxury Services',
      busType: 'I-Shift Multi-Axle AC Semi-Sleeper (2+2)',
      departureTime: '19:00',
      arrivalTime: '04:30',
      duration: '9h 30m',
      basePrice: 780,
      rating: 4.7,
      reviewsCount: 290
    }
  ];

  const created = [];
  for (const b of busTemplates) {
    const busDoc = new Bus({
      busNumber: b.busNumber,
      operatorName: b.operatorName,
      busType: b.busType,
      fromCity,
      toCity,
      boardingPoints: [
        { location: `${fromCity} Central Inter-State Bus Terminus`, time: b.departureTime },
        { location: `${fromCity} Airport Bypass Toll`, time: `${parseInt(b.departureTime) + 1}:00` }
      ],
      droppingPoints: [
        { location: `${toCity} Highway Express Junction`, time: `${parseInt(b.arrivalTime) - 1}:15` },
        { location: `${toCity} Main Bus Station`, time: b.arrivalTime }
      ],
      departureTime: b.departureTime,
      arrivalTime: b.arrivalTime,
      duration: b.duration,
      basePrice: b.basePrice,
      rating: b.rating,
      reviewsCount: b.reviewsCount,
      amenities: ['Live GPS Tracking', 'Personal Charging Port', 'Free Water Bottle', 'Sanitized Blankets', 'Reading Light'],
      totalSeats: 24,
      seats: generateBusSeats(b.basePrice),
      isActive: true
    });
    created.push(busDoc);
  }

  try {
    return await Bus.insertMany(created);
  } catch (err) {
    return created;
  }
}

exports.searchBuses = async (req, res) => {
  try {
    const { from, to, date, busType, operator } = req.query;
    const query = { isActive: true };

    if (from) {
      query.fromCity = new RegExp(from, 'i');
    }

    if (to) {
      query.toCity = new RegExp(to, 'i');
    }

    if (busType) {
      query.busType = new RegExp(busType, 'i');
    }

    if (operator) {
      query.operatorName = new RegExp(operator, 'i');
    }

    let buses = await Bus.find(query);

    // If query has specific from/to and no buses found in DB, generate real-time live express buses!
    if (buses.length === 0 && (from || to)) {
      buses = await generateLiveBuses(from, to);
    } else if (buses.length === 0) {
      buses = await Bus.find({ isActive: true });
    }

    res.json({ success: true, count: buses.length, data: buses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCities = async (req, res) => {
  try {
    const buses = await Bus.find({ isActive: true });
    const cities = new Set();
    buses.forEach(b => {
      cities.add(b.fromCity);
      cities.add(b.toCity);
    });
    res.json({ success: true, data: Array.from(cities) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }
    res.json({ success: true, data: bus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bookBus = async (req, res) => {
  try {
    const {
      busId,
      travelDate,
      selectedSeats,
      passengers,
      boardingPoint,
      droppingPoint,
      contactDetails,
      paymentMethod,
      cardLast4,
      cardHolder
    } = req.body;

    if (!busId || !travelDate || !selectedSeats || selectedSeats.length === 0 || !passengers || !contactDetails) {
      return res.status(400).json({ success: false, message: 'Missing required bus booking details.' });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }

    // Calculate total price based on selected seats
    let totalAmount = 0;
    selectedSeats.forEach(seatNo => {
      const seat = bus.seats.find(s => s.seatNumber === seatNo);
      totalAmount += seat ? seat.price : bus.basePrice;
    });

    // Mark seats as booked on the bus instance
    bus.seats.forEach(s => {
      if (selectedSeats.includes(s.seatNumber)) {
        s.isBooked = true;
      }
    });
    await bus.save();

    const bookingId = generateBusTicket();
    const ticketNumber = 'TKT' + Math.floor(100000 + Math.random() * 900000);

    const booking = new BusBooking({
      bookingId,
      ticketNumber,
      userId: req.user ? req.user.userId : null,
      busId: bus._id,
      busSnapshot: {
        busNumber: bus.busNumber,
        operatorName: bus.operatorName,
        busType: bus.busType,
        fromCity: bus.fromCity,
        toCity: bus.toCity,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        duration: bus.duration,
        boardingPoint: boardingPoint || bus.boardingPoints[0]?.location || 'Main ISBT',
        droppingPoint: droppingPoint || bus.droppingPoints[0]?.location || 'City Center'
      },
      travelDate: new Date(travelDate),
      selectedSeats,
      passengers,
      boardingPoint: boardingPoint || bus.boardingPoints[0]?.location || 'Main ISBT',
      droppingPoint: droppingPoint || bus.droppingPoints[0]?.location || 'City Center',
      contactDetails,
      totalAmount,
      status: 'CONFIRMED',
      paymentId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
      paymentStatus: 'PAID'
    });

    await booking.save();

    // Create Payment Record
    const payment = new Payment({
      transactionId: booking.paymentId,
      bookingType: 'BUS',
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
      message: 'Bus ticket booked successfully!',
      data: booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBusBookingById = async (req, res) => {
  try {
    const booking = await BusBooking.findOne({ bookingId: req.params.bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelBusBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const booking = await BusBooking.findOne({ bookingId });
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

    // Free up seats in bus
    const bus = await Bus.findById(booking.busId);
    if (bus) {
      bus.seats.forEach(s => {
        if (booking.selectedSeats.includes(s.seatNumber)) {
          s.isBooked = false;
        }
      });
      await bus.save();
    }

    await Payment.findOneAndUpdate(
      { bookingId: booking.bookingId },
      { status: 'REFUNDED' }
    );

    res.json({ success: true, message: 'Bus booking cancelled and refund initiated.', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
