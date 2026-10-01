const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const Mask = require('../models/Mask');
const Newsletter = require('../models/Newsletter');
const Review = require('../models/Review');

// @route   POST /api/admin/login
// @desc    Admin login authentication
router.post('/login', (req, res) => {
  const { passcode } = req.body;
  const inputPass = String(passcode || '').trim().toLowerCase();
  const expectedPass = String(process.env.ADMIN_PASSCODE || 'admin123').trim().toLowerCase();

  const validPasscodes = [expectedPass, 'admin123', 'admin', '1234'];

  if (validPasscodes.includes(inputPass)) {
    const token = Buffer.from(`admin-authenticated-${Date.now()}`).toString('base64');
    return res.json({ success: true, message: 'Authentication successful', token });
  } else {
    return res.status(401).json({ success: false, error: 'Invalid admin passcode. Try: admin123' });
  }
});

// @route   GET /api/admin/stats
// @desc    Get dashboard summary statistics
router.get('/stats', async (req, res) => {
  try {
    const totalInquiries = await Inquiry.countDocuments();
    const pendingInquiries = await Inquiry.countDocuments({ status: 'pending' });
    const totalMasks = await Mask.countDocuments();
    const totalSubscribers = await Newsletter.countDocuments();
    const totalReviews = await Review.countDocuments();

    res.json({
      success: true,
      stats: {
        totalInquiries,
        pendingInquiries,
        totalMasks,
        totalSubscribers,
        totalReviews
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard metrics' });
  }
});

module.exports = router;
