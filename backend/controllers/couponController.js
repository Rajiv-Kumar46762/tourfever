const Coupon = require('../models/Coupon');

exports.getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validUntil: { $gte: now }
    }).sort({ discountValue: -1 }).lean();

    res.json({
      success: true,
      count: coupons.length,
      data: coupons.map(c => ({
        code: c.code,
        title: c.title,
        description: c.description,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minBookingAmount: c.minBookingAmount,
        maxDiscountAmount: c.maxDiscountAmount,
        validUntil: c.validUntil
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code, totalAmount = 0 } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, message: 'Please enter a coupon code.' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({ valid: false, message: `Promo code "${cleanCode}" is invalid.` });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ valid: false, message: `Promo code "${cleanCode}" is no longer active.` });
    }

    if (new Date() > new Date(coupon.validUntil)) {
      return res.status(400).json({ valid: false, message: `Promo code "${cleanCode}" has expired.` });
    }

    const numAmount = Number(totalAmount) || 0;
    if (coupon.minBookingAmount && numAmount < coupon.minBookingAmount) {
      return res.status(400).json({
        valid: false,
        message: `This coupon requires a minimum booking amount of ₹${coupon.minBookingAmount.toLocaleString('en-IN')}.`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENT') {
      discountAmount = Math.round((numAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // FLAT discount
      discountAmount = Math.min(numAmount, coupon.discountValue);
    }

    const finalAmount = Math.max(0, numAmount - discountAmount);

    res.json({
      valid: true,
      success: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      originalAmount: numAmount,
      finalAmount,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discountAmount.toLocaleString('en-IN')}.`
    });
  } catch (err) {
    res.status(500).json({ valid: false, message: err.message });
  }
};
