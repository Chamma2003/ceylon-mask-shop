const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

// @route   POST /api/newsletter
// @desc    Subscribe to newsletter
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existingSubscriber) {
      return res.status(200).json({ success: true, message: 'You are already subscribed to our newsletter!' });
    }

    const subscriber = await Newsletter.create({ email });
    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! You will receive our folklore stories and custom drop alerts.',
      data: subscriber
    });
  } catch (err) {
    console.error('Error saving newsletter subscription:', err);
    res.status(500).json({ success: false, error: 'Server Error saving subscription' });
  }
});

// @route   GET /api/newsletter
// @desc    Get all subscribers (Administrative)
router.get('/', async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });
    res.json({ success: true, count: subscribers.length, data: subscribers });
  } catch (err) {
    console.error('Error fetching subscribers:', err);
    res.status(500).json({ success: false, error: 'Server Error fetching subscribers' });
  }
});

module.exports = router;
