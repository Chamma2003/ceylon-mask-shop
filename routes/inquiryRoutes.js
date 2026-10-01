const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');

// @route   POST /api/inquiries
// @desc    Submit a new customer inquiry / custom order request
router.post('/', async (req, res) => {
  try {
    const { name, email, inquiryType, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required fields.' });
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      inquiryType: inquiryType || 'custom',
      message
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your mask inquiry has been saved. Our master craftsman will contact you via email within 24 hours.',
      data: inquiry
    });
  } catch (err) {
    console.error('Error saving inquiry:', err);
    res.status(500).json({ success: false, error: 'Server Error saving inquiry' });
  }
});

// @route   GET /api/inquiries
// @desc    Get all inquiries (Administrative)
router.get('/', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (err) {
    console.error('Error fetching inquiries:', err);
    res.status(500).json({ success: false, error: 'Server Error fetching inquiries' });
  }
});

// @route   PUT /api/inquiries/:id
// @desc    Update inquiry status (pending, contacted, completed, cancelled)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'contacted', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    res.json({ success: true, data: inquiry });
  } catch (err) {
    console.error('Error updating inquiry status:', err);
    res.status(500).json({ success: false, error: 'Failed to update inquiry status' });
  }
});

// @route   DELETE /api/inquiries/:id
// @desc    Delete inquiry record
router.delete('/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (err) {
    console.error('Error deleting inquiry:', err);
    res.status(500).json({ success: false, error: 'Failed to delete inquiry' });
  }
});

module.exports = router;
