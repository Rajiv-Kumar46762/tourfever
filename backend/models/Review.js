const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  userName: { 
    type: String, 
    default: 'Valued Traveler', 
    trim: true 
  },
  packageId: { 
    type: String 
  },
  packageTitle: { 
    type: String, 
    required: true, 
    index: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    required: true, 
    trim: true 
  },
  isVerifiedTraveler: { 
    type: Boolean, 
    default: false 
  },
  travelDate: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Fast lookups for reviews of specific packages
ReviewSchema.index({ packageTitle: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
