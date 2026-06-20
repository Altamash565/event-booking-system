require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for the assignment
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logger middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', bookingRoutes); // maps /api/reserve and /api/bookings

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Sort My Scene API is running' });
});

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sortmyscene';
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    // Start Server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
  });
