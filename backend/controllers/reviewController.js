const Review = require('../models/Review');
const PackageBooking = require('../models/PackageBooking');

exports.getReviews = async (req, res) => {
  try {
    const { packageTitle, packageId, limit = 20 } = req.query;
    const filter = {};
    if (packageTitle) filter.packageTitle = packageTitle;
    if (packageId) filter.packageId = packageId;

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    // Aggregation pipeline to compute average rating and count
    const statsMatch = packageTitle ? { packageTitle } : (packageId ? { packageId } : {});
    const stats = await Review.aggregate([
      { $match: statsMatch },
      { 
        $group: { 
          _id: '$packageTitle', 
          avgRating: { $avg: '$rating' }, 
          totalReviews: { $sum: 1 },
          fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          lowStars: { $sum: { $cond: [{ $lte: ['$rating', 2] }, 1, 0] } }
        } 
      }
    ]);

    const aggregateResult = stats[0] || {
      avgRating: 4.9,
      totalReviews: reviews.length,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      lowStars: 0
    };

    // Check review eligibility for currently authenticated user
    let userEligible = {
      hasBooked: false,
      alreadyReviewed: false,
      canReview: false,
      reason: 'Please log in to submit a review.'
    };

    const currentUserId = req.user ? (req.user.userId || req.user._id) : null;
    const currentUserEmail = (req.user?.email || '').trim().toLowerCase();

    if (currentUserId && packageTitle) {
      const orUser = [{ userId: currentUserId }];
      if (currentUserEmail) {
        orUser.push({ 'primaryContact.email': new RegExp(`^${currentUserEmail}$`, 'i') });
      }

      const booked = await PackageBooking.findOne({
        packageTitle,
        status: { $in: ['CONFIRMED', 'COMPLETED'] },
        $or: orUser
      });

      const existing = await Review.findOne({
        packageTitle,
        userId: currentUserId
      });

      userEligible = {
        hasBooked: !!booked,
        alreadyReviewed: !!existing,
        canReview: !!booked && !existing,
        reason: !booked
          ? 'Only travelers who have confirmed or completed a reservation for this package can write a review.'
          : (existing ? 'You have already submitted a review for this package.' : 'Eligible')
      };
    }

    res.json({
      success: true,
      count: reviews.length,
      stats: {
        avgRating: Number(aggregateResult.avgRating.toFixed(1)),
        totalReviews: aggregateResult.totalReviews,
        breakdown: {
          5: aggregateResult.fiveStars,
          4: aggregateResult.fourStars,
          3: aggregateResult.threeStars,
          2: aggregateResult.lowStars
        }
      },
      userEligible,
      data: reviews
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const userId = req.user ? (req.user.userId || req.user._id) : null;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please sign in to write a review.' });
    }

    const { packageTitle, packageId, rating, comment, travelDate } = req.body;
    if (!packageTitle || !comment) {
      return res.status(400).json({ success: false, message: 'Package title and review comment are required.' });
    }

    const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const userName = req.user?.name || req.user?.username || 'Valued Traveler';
    const userEmail = (req.user?.email || '').trim().toLowerCase();

    // STRICT REFERENTIAL CONSTRAINT:
    // Only travelers with a confirmed or completed booking for this package can submit a review
    const orUser = [{ userId }];
    if (userEmail) {
      orUser.push({ 'primaryContact.email': new RegExp(`^${userEmail}$`, 'i') });
    }

    const verifiedBooking = await PackageBooking.findOne({
      packageTitle,
      status: { $in: ['CONFIRMED', 'COMPLETED'] },
      $or: orUser
    });

    if (!verifiedBooking) {
      return res.status(403).json({
        success: false,
        message: `Review restricted: Only travelers who have confirmed or completed a booking for "${packageTitle}" are eligible to submit a review.`
      });
    }

    // Check if user has already reviewed this package to prevent duplicate spam
    const existingReview = await Review.findOne({
      userId,
      packageTitle
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: `You have already submitted a review for "${packageTitle}". Thank you!`
      });
    }

    const review = new Review({
      userId,
      userName,
      packageId: packageId || 'pkg-custom',
      packageTitle,
      rating: numericRating,
      comment: comment.trim(),
      isVerifiedTraveler: true,
      travelDate: travelDate || new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    });

    await review.save();

    // Recompute package stats via aggregation
    const updatedStats = await Review.aggregate([
      { $match: { packageTitle } },
      { 
        $group: { 
          _id: '$packageTitle', 
          avgRating: { $avg: '$rating' }, 
          totalReviews: { $sum: 1 } 
        } 
      }
    ]);

    const stat = updatedStats[0] || { avgRating: numericRating, totalReviews: 1 };

    res.status(201).json({
      success: true,
      message: 'Your verified traveler review was published successfully!',
      isVerifiedTraveler: true,
      data: review,
      stats: {
        avgRating: Number(stat.avgRating.toFixed(1)),
        totalReviews: stat.totalReviews
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
