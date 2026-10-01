const mongoose = require('mongoose');

const maskSchema = new mongoose.Schema({
  maskId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    default: 'protection'
  },
  categoryLabel: {
    type: String,
    default: 'Protection & Wealth'
  },
  price: {
    type: String,
    required: true,
    default: 'LKR 25,000'
  },
  priceAmount: {
    type: Number,
    default: 25000
  },
  dimensions: {
    type: String,
    default: '18" x 12" x 6"'
  },
  aura: {
    type: String,
    default: 'Protective energy & timeless heritage'
  },
  imgSrc: {
    type: String,
    default: 'assets/hero_mask.png'
  },
  description: {
    type: String,
    default: 'Authentic hand-carved Sri Lankan Kaduru wood mask.'
  },
  inStock: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mask', maskSchema);
