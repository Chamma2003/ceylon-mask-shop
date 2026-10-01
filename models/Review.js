const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  maskId: {
    type: String,
    default: 'general',
    trim: true
  },
  maskTitle: {
    type: String,
    default: 'Ceylon Mask Collection'
  },
  reviewerName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: 'International Collector'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', reviewSchema);
