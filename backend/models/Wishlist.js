const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  packageId: { 
    type: String, 
    required: true 
  },
  packageTitle: { 
    type: String, 
    required: true 
  },
  destination: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: String, 
    default: '5 Days / 4 Nights' 
  },
  price: { 
    type: Number, 
    required: true 
  },
  image: { 
    type: String 
  },
  rating: { 
    type: Number, 
    default: 4.8 
  },
  notes: { 
    type: String 
  }
}, { timestamps: true });

// Ensure unique package per user
WishlistSchema.index({ userId: 1, packageId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
