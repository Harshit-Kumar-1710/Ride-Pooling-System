const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { timestamps: true });

// Prevent duplicate reviews
reviewSchema.index({ rideId: 1, fromUserId: 1, toUserId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
