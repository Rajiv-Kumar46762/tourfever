const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  roomType: { type: String, required: true }, // e.g. "Deluxe Ocean View Room", "Executive Suite", "Presidential Pool Villa"
  pricePerNight: { type: Number, required: true },
  maxGuests: { type: Number, default: 2 },
  bedType: { type: String, default: '1 King Bed or 2 Twin Beds' },
  size: { type: String, default: '350 sq.ft' },
  amenities: [{ type: String }],
  availableCount: { type: Number, default: 10 },
  image: { type: String }
}, { _id: false });

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  location: { type: String, required: true },
  starRating: { type: Number, default: 5 },
  userRating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 340 },
  image: { type: String, required: true },
  gallery: [{ type: String }],
  description: { type: String, required: true },
  amenities: [{ type: String }], // e.g. ["Free WiFi", "Infinity Pool", "Luxury Spa", "Beachfront", "Valet Parking", "Fine Dining"]
  startingPrice: { type: Number, required: true },
  rooms: [RoomSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', HotelSchema);
