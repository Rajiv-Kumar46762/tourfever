const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  discountType: { 
    type: String, 
    enum: ['PERCENT', 'FLAT'], 
    default: 'PERCENT' 
  },
  discountValue: { 
    type: Number, 
    required: true 
  },
  minBookingAmount: { 
    type: Number, 
    default: 0 
  },
  maxDiscountAmount: { 
    type: Number, 
    default: 5000 
  },
  validUntil: { 
    type: Date, 
    required: true 
  },
  usageCount: { 
    type: Number, 
    default: 0 
  },
  maxUsageLimit: { 
    type: Number, 
    default: 1000 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

CouponSchema.index({ code: 1, isActive: 1 });

module.exports = mongoose.model('Coupon', CouponSchema);
