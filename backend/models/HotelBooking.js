const mongoose = require('mongoose');

const HotelGuestSchema = new mongoose.Schema({
  title: { type: String, default: 'Mr' },
  fullName: { type: String, required: true, trim: true },
  age: { type: Number, default: 30 }
}, { _id: false });

const HotelBookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  confirmationCode: { type: String, required: true, uppercase: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  hotelSnapshot: {
    name: String,
    city: String,
    address: String,
    location: String,
    starRating: Number,
    image: String
  },
  roomType: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  nights: { type: Number, required: true, default: 1 },
  roomsCount: { type: Number, required: true, default: 1 },
  guestsCount: { type: Number, required: true, default: 1 },
  guests: [HotelGuestSchema],
  primaryContact: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    specialRequests: { type: String, default: '' }
  },
  taxes: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED'], default: 'CONFIRMED' },
  paymentId: { type: String },
  paymentStatus: { type: String, enum: ['PAID', 'REFUNDED', 'PENDING'], default: 'PAID' },
  cancellationReason: { type: String },
  cancelledAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('HotelBooking', HotelBookingSchema);
