const mongoose = require('mongoose');

const TrainPassengerSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  berthPreference: { type: String, default: 'No Preference' },
  allocatedCoach: { type: String, default: 'B1' },
  allocatedBerth: { type: String, default: '23 (Lower)' }
}, { _id: false });

const TrainBookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  pnr: { type: String, required: true, uppercase: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  trainSnapshot: {
    trainNumber: String,
    trainName: String,
    fromStation: String,
    fromCode: String,
    toStation: String,
    toCode: String,
    fromCity: String,
    toCity: String,
    departureTime: String,
    arrivalTime: String,
    duration: String
  },
  journeyDate: { type: Date, required: true },
  selectedClass: { type: String, required: true }, // e.g. "3A"
  quota: { type: String, default: 'General' },
  passengers: [TrainPassengerSchema],
  contactDetails: {
    name: String,
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  farePerPassenger: { type: Number, required: true },
  cateringFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED'], default: 'CONFIRMED' },
  paymentId: { type: String },
  paymentStatus: { type: String, enum: ['PAID', 'REFUNDED', 'PENDING'], default: 'PAID' },
  cancellationReason: { type: String },
  cancelledAt: { type: Date },
  disclaimer: {
    type: String,
    default: 'Tour Fever Express Rail Service. Official IRCTC booking integration requires IRCTC API credentials.'
  }
}, { timestamps: true });

module.exports = mongoose.model('TrainBooking', TrainBookingSchema);
