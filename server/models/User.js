const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  collegeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 3.0
  },
  totalRidesOffered: {
    type: Number,
    default: 0
  },
  totalRatingCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);