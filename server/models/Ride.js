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
  vehicle: {
    model:    { type: String, required: true, trim: true },
    number:   { type: String, required: true, trim: true, uppercase: true },
    color:    { type: String, required: true, trim: true },
    type:     { type: String, enum: ['Car', 'Bike', 'Scooter', 'Other'], default: 'Car' },
    fuelType: { type: String, enum: ['Petrol', 'Diesel', 'EV / Electric', 'CNG', 'Hybrid'], required: true, default: 'Petrol' }
  },
  status: {
    type: String,
    enum: ['open', 'full', 'completed', 'cancelled'],
    default: 'open'
  }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);