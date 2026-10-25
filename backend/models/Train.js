const mongoose = require('mongoose');

const TrainClassSchema = new mongoose.Schema({
  classCode: { type: String, required: true, uppercase: true }, // e.g. "1A", "2A", "3A", "SL", "CC", "EC"
  className: { type: String, required: true },                 // e.g. "AC First Class", "Sleeper"
  fare: { type: Number, required: true },
  availableSeats: { type: Number, default: 45 },
  statusText: { type: String, default: 'AVAILABLE' }
}, { _id: false });

const TrainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true },
  trainName: { type: String, required: true, trim: true },
  fromStation: { type: String, required: true },
  fromCode: { type: String, required: true, uppercase: true },
  toStation: { type: String, required: true },
  toCode: { type: String, required: true, uppercase: true },
  fromCity: { type: String, required: true },
  toCity: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String, required: true },
  runningDays: [{ type: String }], // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  classes: [TrainClassSchema],
  pantryAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Train', TrainSchema);
