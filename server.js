const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const maskRoutes = require('./routes/maskRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ceylon_mask';

// CORS Middleware for full HTTP verbs & local file access
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/masks', maskRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date()
  });
});

// Connect to MongoDB & Start Server
const startServer = async () => {
  try {
    console.log(`Connecting to MongoDB (${MONGODB_URI})...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB.');
  } catch (err) {
    console.warn('MongoDB connection warning:', err.message);
    console.warn('Server will continue running. Please ensure MongoDB service or Atlas connection string is active.');
  }

  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` Ceylon Mask Ambalangoda Server is running!`);
    console.log(` Server URL: http://localhost:${PORT}`);
    console.log(` Admin Portal: http://localhost:${PORT}/admin.html`);
    console.log(` API Health: http://localhost:${PORT}/api/health`);
    console.log(`===================================================`);
  });
};

startServer();
