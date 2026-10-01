const express = require('express');
const router = express.Router();
const Mask = require('../models/Mask');

// @route   GET /api/masks
// @desc    Get all masks (optionally filter by category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    const masks = await Mask.find(filter).sort({ createdAt: 1 });
    res.json({ success: true, count: masks.length, data: masks });
  } catch (err) {
    console.error('Error fetching masks:', err);
    res.status(500).json({ success: false, error: 'Server Error fetching masks' });
  }
});

// @route   GET /api/masks/:id
// @desc    Get single mask by maskId or MongoDB _id
router.get('/:id', async (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    let mask = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      mask = await Mask.findById(id);
    }
    if (!mask && id) {
      mask = await Mask.findOne({ maskId: id });
    }
    if (!mask) {
      return res.status(404).json({ success: false, error: 'Mask not found' });
    }
    res.json({ success: true, data: mask });
  } catch (err) {
    console.error('Error fetching mask:', err);
    res.status(500).json({ success: false, error: 'Server Error fetching mask details' });
  }
});

// @route   POST /api/masks
// @desc    Create a new mask item (Admin / API)
router.post('/', async (req, res) => {
  try {
    let maskId = req.body.maskId ? req.body.maskId.toLowerCase().trim().replace(/[^a-z0-9]/g, '-') : '';
    if (!maskId && req.body.title) {
      maskId = req.body.title.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
    }
    if (!maskId) {
      maskId = 'mask-' + Date.now();
    }

    // Ensure maskId uniqueness
    const existing = await Mask.findOne({ maskId });
    if (existing) {
      maskId = `${maskId}-${Date.now().toString().slice(-4)}`;
    }

    req.body.maskId = maskId;

    const newMask = await Mask.create(req.body);
    res.status(201).json({ success: true, data: newMask });
  } catch (err) {
    console.error('Error creating mask:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/masks/:id
// @desc    Update mask details by maskId or MongoDB _id
router.put('/:id', async (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    let mask = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      mask = await Mask.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    }
    if (!mask && id) {
      mask = await Mask.findOneAndUpdate({ maskId: id }, req.body, { new: true, runValidators: true });
    }

    if (!mask) {
      return res.status(404).json({ success: false, error: 'Mask product not found' });
    }

    res.json({ success: true, data: mask });
  } catch (err) {
    console.error('Error updating mask:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/masks/:id
// @desc    Delete mask by maskId or MongoDB _id
router.delete('/:id', async (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    let mask = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      mask = await Mask.findByIdAndDelete(id);
    }
    if (!mask && id) {
      mask = await Mask.findOneAndDelete({ maskId: id });
    }

    if (!mask) {
      return res.status(404).json({ success: false, error: `Product '${id}' not found in database.` });
    }

    res.json({ success: true, message: 'Mask product deleted successfully', data: mask });
  } catch (err) {
    console.error('Error deleting mask:', err);
    res.status(500).json({ success: false, error: 'Database error deleting product: ' + err.message });
  }
});

module.exports = router;
