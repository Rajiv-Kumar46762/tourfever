const mongoose = require('mongoose');

const PackagePassengerSchema = new mongoose.Schema({
  fullName: { type: String, default: 'Valued Traveler', trim: true },
  age: { type: Number, default: 28 },
  gender: { type: String, default: 'Male' }
}, { _id: false });

const PackageBookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  referenceNumber: { type: String, required: true, uppercase: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  packageTitle: { type: String, required: true },
  destination: { type: String, required: true },
  duration: { type: String, default: '5D/4N' },
  travelDate: { type: Date, required: true },
  paxCount: { type: Number, required: true, default: 1 },
  pricePerPerson: { type: Number, required: true },
  passengers: [PackagePassengerSchema],
  primaryContact: {
    fullName: { type: String, default: 'Valued Traveler' },
    email: { type: String, default: 'traveler@tourfever.com' },
    phone: { type: String, default: '+91 9876543210' }
  },
  baseFare: { type: Number, required: true },
  taxes: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED'], default: 'CONFIRMED' },
  paymentId: { type: String },
  paymentStatus: { type: String, enum: ['PAID', 'REFUNDED', 'PENDING'], default: 'PAID' },
  paymentMethod: { type: String, default: 'CARD' },
  cardLast4: { type: String, default: '4242' },
  cancellationReason: { type: String },
  cancelledAt: { type: Date },
  couponCode: { type: String, trim: true },
  discountAmount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('PackageBooking', PackageBookingSchema);
