const mongoose = require('mongoose');

const PassengerSchema = new mongoose.Schema({
  title: { type: String, enum: ['Mr', 'Mrs', 'Ms', 'Master'], default: 'Mr' },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  seatNumber: { type: String, default: 'Auto-Assigned' }
}, { _id: false });

const FlightBookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  pnr: { type: String, required: true, uppercase: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  flightSnapshot: {
    airline: String,
    airlineCode: String,
    flightNumber: String,
    fromCity: String,
    fromAirport: String,
    fromCode: String,
    toCity: String,
    toAirport: String,
    toCode: String,
    departureTime: String,
    arrivalTime: String,
    duration: String,
    stops: Number,
    stopDetails: String,
    baggage: { cabin: String, checkin: String }
  },
  tripType: { type: String, enum: ['one-way', 'round-trip'], default: 'one-way' },
  travelDate: { type: Date, required: true },
  returnDate: { type: Date },
  selectedClass: { type: String, required: true, default: 'Economy' },
  passengers: [PassengerSchema],
  contactDetails: {
    name: String,
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  baseFare: { type: Number, required: true },
  taxesAndFees: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED'], default: 'CONFIRMED' },
  paymentId: { type: String },
  paymentStatus: { type: String, enum: ['PAID', 'REFUNDED', 'PENDING'], default: 'PAID' },
  cancellationReason: { type: String },
  cancelledAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('FlightBooking', FlightBookingSchema);
