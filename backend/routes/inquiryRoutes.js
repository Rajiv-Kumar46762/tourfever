const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const { optionalAuth, authRequired } = require('../middleware/authMiddleware');

// POST /api/inquiries
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { destination, people, checkin, checkout, userName, userEmail, phone } = req.body;
    if (!destination) {
      return res.status(400).json({ success: false, error: 'Destination is required.' });
    }
    const inquiry = new Inquiry({
      destination,
      people: Number(people) || 2,
      checkin: checkin ? String(checkin) : undefined,
      checkout: checkout ? String(checkout) : undefined,
      userName: userName || req.user?.name || req.user?.username || 'Valued Traveler',
      userEmail: userEmail || req.user?.email || 'traveler@tourfever.com',
      phone: phone || req.user?.phone || '',
      userId: req.user?.userId || null,
      status: 'Submitted'
    });
    await inquiry.save();
    res.status(201).json({ success: true, message: 'Inquiry submitted successfully', inquiry, data: inquiry });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/inquiries (fetches inquiries strictly for the active user or contact email)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    let userEmail = (req.user?.email || req.query.email || '').trim().toLowerCase();
    let userPhone = (req.user?.phone || req.query.phone || '').trim();

    if (userId && !userEmail) {
      try {
        const User = require('../models/User');
        const userDoc = await User.findById(userId).lean();
        if (userDoc) {
          userEmail = (userDoc.email || '').trim().toLowerCase();
          if (!userPhone) userPhone = (userDoc.phone || '').trim();
        }
      } catch (e) {}
    }

    if (!userId && !userEmail && !userPhone) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const orConditions = [];
    if (userId) orConditions.push({ userId });
    if (userEmail) orConditions.push({ userEmail: new RegExp(`^${userEmail}$`, 'i') });
    if (userPhone) orConditions.push({ phone: userPhone });

    const inquiries = await Inquiry.find({ $or: orConditions }).sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
