const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  deck: { type: String, enum: ['lower', 'upper'], default: 'lower' },
  type: { type: String, enum: ['seater', 'sleeper'], default: 'seater' },
  isBooked: { type: Boolean, default: false },
  genderPreference: { type: String, enum: ['all', 'female', 'male'], default: 'all' },
  price: { type: Number, required: true }
}, { _id: false });

const BusSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  operatorName: { type: String, required: true, trim: true },
  busType: { type: String, required: true }, // e.g. "Volvo Multi-Axle A/C Sleeper (2+1)"
  fromCity: { type: String, required: true },
  toCity: { type: String, required: true },
  boardingPoints: [{
    location: String,
    time: String
  }],
  droppingPoints: [{
    location: String,
    time: String
  }],
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String, required: true },
  basePrice: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 120 },
  amenities: [{ type: String }], // e.g. ["Live Tracking", "Blanket", "Charging Point", "Water Bottle", "WiFi"]
  totalSeats: { type: Number, default: 36 },
  seats: [SeatSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Bus', BusSchema);
