const PackageBooking = require('../models/PackageBooking');
const Payment = require('../models/Payment');

function generatePackageBookingId() {
  return 'TF-PKG-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
}

function generatePackageRef() {
  return 'PKG' + Math.floor(100000 + Math.random() * 900000);
}

function formatGender(g) {
  if (!g) return 'Male';
  const lower = String(g).toLowerCase().trim();
  if (lower === 'female') return 'Female';
  if (lower === 'other') return 'Other';
  return 'Male';
}

function normalizePaymentMethod(pm) {
  if (!pm) return 'CARD';
  const str = String(pm).toUpperCase().trim();
  if (str.includes('UPI')) return 'UPI';
  if (str.includes('NET') || str.includes('BANK')) return 'NET_BANKING';
  return 'CARD';
}

exports.bookPackage = async (req, res) => {
  try {
    const {
      packageTitle,
      destination,
      duration,
      travelDate,
      paxCount,
      pricePerPerson,
      passengers,
      primaryContact = {},
      paymentMethod,
      cardNumber,
      cardLast4,
      cardHolder,
      couponCode,
      discountAmount: rawDiscount,
      totalAmount: rawTotal
    } = req.body;

    if (!packageTitle) {
      return res.status(400).json({ success: false, message: 'Missing package title.' });
    }

    const contactName = primaryContact?.fullName || primaryContact?.name || req.user?.name || req.user?.username || 'Valued Traveler';
    const contactEmail = primaryContact?.email || req.user?.email || 'traveler@tourfever.com';
    const contactPhone = primaryContact?.phone || req.user?.phone || '+91 9876543210';

    const numPax = Math.max(1, Number(paxCount) || (passengers ? passengers.length : 1));
    const unitPrice = Number(pricePerPerson) || 1290;
    const baseFare = unitPrice * numPax;
    const taxes = Math.round(baseFare * 0.10);
    const discount = Math.max(0, Number(rawDiscount) || 0);
    const calculatedTotal = Math.max(0, baseFare + taxes - discount);
    const totalAmount = rawTotal !== undefined && Number(rawTotal) >= 0 ? Number(rawTotal) : calculatedTotal;

    const bookingId = generatePackageBookingId();
    const referenceNumber = generatePackageRef();

    const bookingPassengers = passengers && passengers.length > 0
      ? passengers.map(p => ({
          fullName: p.fullName || p.name || contactName,
          age: Number(p.age) || 28,
          gender: formatGender(p.gender)
        }))
      : [{ fullName: contactName, age: 28, gender: 'Male' }];

    const last4 = cardNumber ? cardNumber.replace(/\s+/g, '').slice(-4) : (cardLast4 || '4242');

    const booking = new PackageBooking({
      bookingId,
      referenceNumber,
      userId: req.user ? req.user.userId : null,
      packageTitle,
      destination: destination || 'Exotic Island',
      duration: duration || '5D/4N',
      travelDate: travelDate ? new Date(travelDate) : new Date(Date.now() + 86400000 * 7),
      paxCount: numPax,
      pricePerPerson: unitPrice,
      passengers: bookingPassengers,
      primaryContact: {
        fullName: contactName,
        email: contactEmail,
        phone: contactPhone
      },
      baseFare,
      taxes,
      totalAmount,
      couponCode: couponCode ? String(couponCode).toUpperCase().trim() : undefined,
      discountAmount: discount,
      status: 'CONFIRMED',
      paymentId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
      paymentStatus: 'PAID',
      paymentMethod: normalizePaymentMethod(paymentMethod),
      cardLast4: last4
    });

    await booking.save();

    // Increment coupon usage count if applied
    if (couponCode) {
      try {
        const Coupon = require('../models/Coupon');
        await Coupon.findOneAndUpdate(
          { code: String(couponCode).toUpperCase().trim() },
          { $inc: { usageCount: 1 } }
        );
      } catch (couponErr) {
        console.warn('Coupon counter update note:', couponErr.message);
      }
    }

    // Create payment transaction log
    const payment = new Payment({
      transactionId: booking.paymentId,
      bookingType: 'PACKAGE',
      bookingId: booking.bookingId,
      userId: req.user ? req.user.userId : null,
      amount: totalAmount,
      currency: 'INR',
      paymentMethod: normalizePaymentMethod(paymentMethod),
      cardHolder: cardHolder || contactName,
      cardLast4: last4,
      status: 'SUCCESS',
      paymentGateway: 'Tour Fever SecurePay'
    });
    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Holiday package booked successfully!',
      booking: booking,
      data: booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPackageBookingById = async (req, res) => {
  try {
    const booking = await PackageBooking.findOne({ bookingId: req.params.bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Package booking not found.' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelPackageBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const booking = await PackageBooking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Package booking not found.' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Package booking is already cancelled.' });
    }

    booking.status = 'CANCELLED';
    booking.paymentStatus = 'REFUNDED';
    booking.cancellationReason = reason || 'Customer requested cancellation';
    booking.cancelledAt = new Date();
    await booking.save();

    await Payment.findOneAndUpdate(
      { bookingId: booking.bookingId },
      { status: 'REFUNDED' }
    );

    res.json({
      success: true,
      message: `Package booking (${bookingId}) cancelled and refund of ₹${booking.totalAmount.toLocaleString('en-IN')} processed successfully.`,
      data: booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
