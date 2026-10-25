const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
  destination: { type: String, required: true },
  people: { type: Number, default: 2 },
  checkin: { type: String },
  checkout: { type: String },
  userName: { type: String, default: 'Valued Traveler' },
  userEmail: { type: String, default: 'traveler@tourfever.com' },
  phone: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Submitted' },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inquiry', InquirySchema);
