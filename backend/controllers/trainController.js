const Train = require('../models/Train');
const TrainBooking = require('../models/TrainBooking');
const Payment = require('../models/Payment');

function generateTrainPNR() {
  let pnr = '';
  for (let i = 0; i < 10; i++) {
    pnr += Math.floor(Math.random() * 10).toString();
  }
  return pnr;
}

function generateTrainBookingId() {
  return 'TF-TR-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
}

const CITY_STATIONS = {
  delhi: { station: 'New Delhi Railway Station', code: 'NDLS', city: 'Delhi' },
  mumbai: { station: 'Mumbai Central', code: 'MMCT', city: 'Mumbai' },
  bangalore: { station: 'KSR Bengaluru Junction', code: 'SBC', city: 'Bangalore' },
  bengaluru: { station: 'KSR Bengaluru Junction', code: 'SBC', city: 'Bangalore' },
  goa: { station: 'Madgaon Junction', code: 'MAO', city: 'Goa' },
  jaipur: { station: 'Jaipur Junction', code: 'JP', city: 'Jaipur' },
  varanasi: { station: 'Varanasi Junction', code: 'BSB', city: 'Varanasi' },
  agra: { station: 'Agra Cantt Railway Station', code: 'AGC', city: 'Agra' },
  kolkata: { station: 'Howrah Junction', code: 'HWH', city: 'Kolkata' },
  chennai: { station: 'Chennai Central', code: 'MAS', city: 'Chennai' },
  hyderabad: { station: 'Secunderabad Junction', code: 'SC', city: 'Hyderabad' },
  pune: { station: 'Pune Junction', code: 'PUNE', city: 'Pune' },
  ahmedabad: { station: 'Ahmedabad Junction', code: 'ADI', city: 'Ahmedabad' },
  amritsar: { station: 'Amritsar Junction', code: 'ASR', city: 'Amritsar' },
};

function getStationInfo(cityStr) {
  if (!cityStr) return null;
  const key = cityStr.toLowerCase().trim();
  for (const [k, v] of Object.entries(CITY_STATIONS)) {
    if (key.includes(k) || k.includes(key) || v.code.toLowerCase() === key) {
      return v;
    }
  }
  const clean = cityStr.charAt(0).toUpperCase() + cityStr.slice(1).toLowerCase();
  return {
    station: `${clean} Central Railway Station`,
    code: clean.slice(0, 3).toUpperCase(),
    city: clean
  };
}

async function generateLiveTrains(fromStr, toStr) {
  const fromInfo = getStationInfo(fromStr) || { station: 'New Delhi Railway Station', code: 'NDLS', city: 'Delhi' };
  const toInfo = getStationInfo(toStr) || { station: 'Mumbai Central', code: 'MMCT', city: 'Mumbai' };

  if (fromInfo.city.toLowerCase() === toInfo.city.toLowerCase()) {
    return [];
  }

  const randNum = Math.floor(10000 + Math.random() * 80000);
  const trainTemplates = [
    {
      trainNumber: `${randNum}`,
      trainName: `${toInfo.city} Vande Bharat Express`,
      departureTime: '06:00',
      arrivalTime: '13:45',
      duration: '7h 45m',
      classes: [
        { classCode: 'CC', className: 'AC Chair Car', fare: 1240, availableSeats: Math.floor(25 + Math.random() * 30), statusText: 'AVAILABLE-42' },
        { classCode: 'EC', className: 'Exec Chair Car', fare: 2350, availableSeats: Math.floor(8 + Math.random() * 15), statusText: 'AVAILABLE-12' }
      ]
    },
    {
      trainNumber: `${randNum + 1}`,
      trainName: `${fromInfo.city} - ${toInfo.city} Superfast Express`,
      departureTime: '11:20',
      arrivalTime: '20:10',
      duration: '8h 50m',
      classes: [
        { classCode: '1A', className: 'AC First Class', fare: 2450, availableSeats: Math.floor(6 + Math.random() * 10), statusText: 'AVAILABLE-8' },
        { classCode: '2A', className: 'AC 2 Tier', fare: 1650, availableSeats: Math.floor(18 + Math.random() * 20), statusText: 'AVAILABLE-24' },
        { classCode: '3A', className: 'AC 3 Tier', fare: 1150, availableSeats: Math.floor(45 + Math.random() * 40), statusText: 'AVAILABLE-58' },
        { classCode: 'SL', className: 'Sleeper Class', fare: 420, availableSeats: Math.floor(80 + Math.random() * 60), statusText: 'AVAILABLE-92' }
      ]
    },
    {
      trainNumber: `${randNum + 2}`,
      trainName: `${toInfo.city} Rajdhani Express`,
      departureTime: '16:55',
      arrivalTime: '08:35',
      duration: '15h 40m',
      classes: [
        { classCode: '1A', className: 'AC First Class', fare: 3120, availableSeats: Math.floor(5 + Math.random() * 8), statusText: 'AVAILABLE-6' },
        { classCode: '2A', className: 'AC 2 Tier', fare: 2150, availableSeats: Math.floor(14 + Math.random() * 16), statusText: 'AVAILABLE-18' },
        { classCode: '3A', className: 'AC 3 Tier', fare: 1550, availableSeats: Math.floor(35 + Math.random() * 30), statusText: 'AVAILABLE-44' }
      ]
    }
  ];

  const created = [];
  for (const t of trainTemplates) {
    const trainDoc = new Train({
      trainNumber: t.trainNumber,
      trainName: t.trainName,
      fromStation: fromInfo.station,
      fromCode: fromInfo.code,
      toStation: toInfo.station,
      toCode: toInfo.code,
      fromCity: fromInfo.city,
      toCity: toInfo.city,
      departureTime: t.departureTime,
      arrivalTime: t.arrivalTime,
      duration: t.duration,
      runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      classes: t.classes,
      pantryAvailable: true,
      isActive: true
    });
    created.push(trainDoc);
  }

  try {
    return await Train.insertMany(created);
  } catch (err) {
    return created;
  }
}

exports.searchTrains = async (req, res) => {
  try {
    const { from, to, date, classCode } = req.query;
    const query = { isActive: true };

    if (from) {
      query.$or = [
        { fromStation: new RegExp(from, 'i') },
        { fromCity: new RegExp(from, 'i') },
        { fromCode: new RegExp(from, 'i') }
      ];
    }

    if (to) {
      const toQuery = [
        { toStation: new RegExp(to, 'i') },
        { toCity: new RegExp(to, 'i') },
        { toCode: new RegExp(to, 'i') }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: toQuery }];
        delete query.$or;
      } else {
        query.$or = toQuery;
      }
    }

    let trains = await Train.find(query);

    // If query has specific from/to and no trains found in DB, generate real-time live express trains for that route!
    if (trains.length === 0 && (from || to)) {
      trains = await generateLiveTrains(from, to);
    } else if (trains.length === 0) {
      trains = await Train.find({ isActive: true });
    }

    res.json({
      success: true,
      count: trains.length,
      disclaimer: 'Tour Fever Express Rail Service. Official IRCTC booking is not claimed.',
      data: trains
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStations = async (req, res) => {
  try {
    const trains = await Train.find({ isActive: true });
    const stationMap = new Map();
    trains.forEach(t => {
      stationMap.set(t.fromCode, { station: t.fromStation, code: t.fromCode, city: t.fromCity });
      stationMap.set(t.toCode, { station: t.toStation, code: t.toCode, city: t.toCity });
    });
    res.json({ success: true, data: Array.from(stationMap.values()) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found' });
    }
    res.json({ success: true, data: train });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bookTrain = async (req, res) => {
  try {
    const {
      trainId,
      journeyDate,
      selectedClass,
      quota,
      passengers,
      contactDetails,
      paymentMethod,
      cardLast4,
      cardHolder
    } = req.body;

    if (!trainId || !journeyDate || !selectedClass || !passengers || passengers.length === 0 || !contactDetails) {
      return res.status(400).json({ success: false, message: 'Missing required train booking details.' });
    }

    const train = await Train.findById(trainId);
    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found.' });
    }

    const classObj = train.classes.find(c => c.classCode === selectedClass) || train.classes[0];
    const farePerPassenger = classObj ? classObj.fare : 1150;
    const cateringFee = 0;
    const totalAmount = (farePerPassenger * passengers.length) + cateringFee;

    const bookingId = generateTrainBookingId();
    const pnr = generateTrainPNR();

    // Assign coach and berths for passengers
    const berths = ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];
    const allocatedPassengers = passengers.map((p, idx) => ({
      fullName: p.fullName || contactDetails.name || 'Valued Traveler',
      age: Number(p.age) || 28,
      gender: p.gender || 'Male',
      berthPreference: p.berthPreference || 'No Preference',
      allocatedCoach: `${selectedClass === '1A' ? 'H1' : selectedClass === '2A' ? 'A1' : selectedClass === '3A' ? 'B1' : 'S1'}`,
      allocatedBerth: `${18 + idx} (${p.berthPreference && p.berthPreference !== 'No Preference' ? p.berthPreference : berths[idx % berths.length]})`
    }));

    const booking = new TrainBooking({
      bookingId,
      pnr,
      userId: req.user ? req.user.userId : null,
      trainId: train._id,
      trainSnapshot: {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        fromStation: train.fromStation,
        fromCode: train.fromCode,
        toStation: train.toStation,
        toCode: train.toCode,
        fromCity: train.fromCity,
        toCity: train.toCity,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        duration: train.duration
      },
      journeyDate: new Date(journeyDate),
      selectedClass: classObj ? classObj.classCode : (selectedClass || '3A'),
      quota: quota || 'General',
      passengers: allocatedPassengers,
      contactDetails,
      farePerPassenger,
      cateringFee,
      totalAmount,
      status: 'CONFIRMED',
      paymentId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
      paymentStatus: 'PAID'
    });

    await booking.save();

    // Create Payment Record
    const payment = new Payment({
      transactionId: booking.paymentId,
      bookingType: 'TRAIN',
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
      message: 'Train ticket booked successfully!',
      booking: booking,
      data: booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTrainBookingById = async (req, res) => {
  try {
    const booking = await TrainBooking.findOne({ bookingId: req.params.bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelTrainBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const booking = await TrainBooking.findOne({ bookingId });
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

    await Payment.findOneAndUpdate(
      { bookingId: booking.bookingId },
      { status: 'REFUNDED' }
    );

    res.json({ success: true, message: 'Train ticket cancelled and refund initiated.', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
