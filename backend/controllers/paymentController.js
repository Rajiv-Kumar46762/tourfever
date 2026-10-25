const Payment = require('../models/Payment');

exports.processPayment = async (req, res) => {
  try {
    const {
      bookingType,
      bookingId,
      amount,
      currency,
      paymentMethod,
      cardNumber,
      cardExpiry,
      cardCvv,
      cardHolder
    } = req.body;

    if (!bookingType || !bookingId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing payment details.' });
    }

    // Basic card validation simulation
    const cardLast4 = cardNumber ? cardNumber.replace(/\s+/g, '').slice(-4) : '4242';
    const transactionId = 'TXN-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);

    const payment = new Payment({
      transactionId,
      bookingType,
      bookingId,
      userId: req.user ? req.user.userId : null,
      amount: Number(amount),
      currency: currency || 'INR',
      paymentMethod: paymentMethod || 'CARD',
      cardHolder: cardHolder || 'VALUED TRAVELER',
      cardLast4,
      status: 'SUCCESS'
    });

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully via Tour Fever SecurePay!',
      data: {
        transactionId,
        amount,
        currency: currency || 'INR',
        status: 'SUCCESS',
        paidAt: payment.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user ? (req.user.userId || req.user._id) : null;
    if (!userId) {
      return res.json({ success: true, count: 0, data: [] });
    }
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
