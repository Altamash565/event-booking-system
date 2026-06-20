const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  seatNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'booked'],
    default: 'available',
    required: true
  },
  reservedUntil: {
    type: Date
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness of seat per event
seatSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
