const Wishlist = require('../models/Wishlist');

exports.getMyWishlist = async (req, res) => {
  try {
    const userId = req.user ? (req.user.userId || req.user._id) : null;
    if (!userId) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const items = await Wishlist.find({ userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const userId = req.user ? (req.user.userId || req.user._id) : null;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please sign in to save trips to your wishlist.' });
    }

    const { packageId, packageTitle, destination, duration, price, image, rating, notes } = req.body;
    if (!packageId || !packageTitle) {
      return res.status(400).json({ success: false, message: 'Package identifier and title are required.' });
    }

    const existing = await Wishlist.findOne({ userId, packageId });
    if (existing) {
      await Wishlist.deleteOne({ _id: existing._id });
      return res.json({
        success: true,
        isSaved: false,
        message: `"${packageTitle}" removed from your wishlist.`
      });
    }

    const saved = new Wishlist({
      userId,
      packageId,
      packageTitle,
      destination: destination || 'Exotic Destination',
      duration: duration || '5 Days / 4 Nights',
      price: Number(price) || 0,
      image: image || '/images/packege-1.jpg',
      rating: Number(rating) || 4.9,
      notes: notes || ''
    });
    await saved.save();

    res.status(201).json({
      success: true,
      isSaved: true,
      message: `"${packageTitle}" saved to your wishlist!`,
      data: saved
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user ? (req.user.userId || req.user._id) : null;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please sign in to manage your wishlist.' });
    }

    const { id } = req.params;
    // Allow deleting by either Mongo _id or packageId
    const query = {
      userId,
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { packageId: id }
      ].filter(cond => Object.values(cond)[0] !== null)
    };

    const deleted = await Wishlist.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Item not found in wishlist.' });
    }

    res.json({
      success: true,
      message: 'Item removed from your wishlist successfully.',
      data: deleted
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
