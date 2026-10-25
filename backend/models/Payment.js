const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  bookingType: { type: String, required: true, enum: ['FLIGHT', 'TRAIN', 'BUS', 'HOTEL', 'PACKAGE'] },
  bookingId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, default: 'CARD' },
  cardHolder: { type: String, default: 'VALUED TRAVELER' },
  cardLast4: { type: String, default: '4242' },
  status: { type: String, default: 'SUCCESS' },
  paymentGateway: { type: String, default: 'Tour Fever SecurePay' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
