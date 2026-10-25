const mongoose = require('mongoose');

const BusPassengerSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  seatNumber: { type: String, required: true }
}, { _id: false });

const BusBookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  ticketNumber: { type: String, required: true, uppercase: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  busSnapshot: {
    busNumber: String,
    operatorName: String,
    busType: String,
    fromCity: String,
    toCity: String,
    departureTime: String,
    arrivalTime: String,
    duration: String,
    boardingPoint: String,
    droppingPoint: String
  },
  travelDate: { type: Date, required: true },
  selectedSeats: [{ type: String, required: true }],
  passengers: [BusPassengerSchema],
  boardingPoint: { type: String, required: true },
  droppingPoint: { type: String, required: true },
  contactDetails: {
    name: String,
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED'], default: 'CONFIRMED' },
  paymentId: { type: String },
  paymentStatus: { type: String, enum: ['PAID', 'REFUNDED', 'PENDING'], default: 'PAID' },
  cancellationReason: { type: String },
  cancelledAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('BusBooking', BusBookingSchema);
