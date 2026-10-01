const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// @route   GET /api/reviews
// @desc    Get reviews (optionally filter by maskId)
router.get('/', async (req, res) => {
  try {
    const { maskId } = req.query;
    let filter = {};
    if (maskId && maskId !== 'all') {
      filter.maskId = maskId;
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 5), 0);
    const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : '5.0';

    res.json({
      success: true,
      count: reviews.length,
      avgRating: parseFloat(avgRating),
      data: reviews
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ success: false, error: 'Server Error fetching reviews' });
  }
});

// @route   POST /api/reviews
// @desc    Create a new customer review
router.post('/', async (req, res) => {
  try {
    const { reviewerName, comment, rating, location, maskId, maskTitle } = req.body;

    if (!reviewerName || !comment) {
      return res.status(400).json({ success: false, error: 'Name and comment are required fields.' });
    }

    const review = await Review.create({
      reviewerName: reviewerName.trim(),
      comment: comment.trim(),
      rating: Number(rating) || 5,
      location: location ? location.trim() : 'International Collector',
      maskId: maskId || 'general',
      maskTitle: maskTitle || 'Ceylon Mask Collection'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your authentic review! Your feedback has been published.',
      data: review
    });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review by MongoDB _id (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review record not found' });
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
});

module.exports = router;
