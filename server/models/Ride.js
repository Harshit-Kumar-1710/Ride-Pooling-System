const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  origin: {
    label:     { type: String, required: true },
    latitude:  { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  destination: {
    label:     { type: String, required: true },
    latitude:  { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  departureTime:  { type: Date, required: true },
  seatsAvailable: { type: Number, required: true, min: 1, max: 6 },
  seatsTotal:     { type: Number, required: true },
  status: {
    type: String,
    enum: ['open', 'full', 'completed', 'cancelled'],
    default: 'open'
  }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);