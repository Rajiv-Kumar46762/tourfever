const mongoose = require('mongoose');

const FlightClassSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['Economy', 'Premium Economy', 'Business', 'First Class'] },
  price: { type: Number, required: true },
  availableSeats: { type: Number, default: 30 }
}, { _id: false });

const FlightSchema = new mongoose.Schema({
  airline: { type: String, required: true, trim: true },
  airlineCode: { type: String, required: true, uppercase: true },
  flightNumber: { type: String, required: true, uppercase: true },
  fromCity: { type: String, required: true, trim: true },
  fromAirport: { type: String, required: true },
  fromCode: { type: String, required: true, uppercase: true },
  toCity: { type: String, required: true, trim: true },
  toAirport: { type: String, required: true },
  toCode: { type: String, required: true, uppercase: true },
  departureTime: { type: String, required: true }, // e.g. "06:30"
  arrivalTime: { type: String, required: true },   // e.g. "09:45"
  duration: { type: String, required: true },      // e.g. "3h 15m"
  stops: { type: Number, default: 0 },
  stopDetails: { type: String, default: 'Non-stop' },
  baggage: {
    cabin: { type: String, default: '7 kg' },
    checkin: { type: String, default: '15 kg' }
  },
  classes: [FlightClassSchema],
  mealsIncluded: { type: Boolean, default: false },
  refundable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Flight', FlightSchema);
