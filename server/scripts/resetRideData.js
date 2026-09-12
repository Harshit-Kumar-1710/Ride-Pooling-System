require('dotenv').config();
const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const CreditLedger = require('../models/CreditLedger');
const User = require('../models/User');

const run = async () => {
  if (process.argv[2] !== '--confirm') {
    throw new Error('Refusing to reset data. Re-run with: node scripts/resetRideData.js --confirm');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required. Add it to server/.env or export it before running this script.');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const [bookings, reviews, credits, rides, users] = await Promise.all([
    Booking.deleteMany({}),
    Review.deleteMany({}),
    CreditLedger.deleteMany({}),
    Ride.deleteMany({}),
    User.updateMany({}, {
      $set: {
        credits: 0,
        rating: 3.0,
        totalRidesOffered: 0,
        totalRatingCount: 0
      }
    })
  ]);

  console.log('Ride data reset complete:', {
    deletedBookings: bookings.deletedCount,
    deletedReviews: reviews.deletedCount,
    deletedCreditEntries: credits.deletedCount,
    deletedRides: rides.deletedCount,
    resetUsers: users.modifiedCount
  });
};

run()
  .catch((error) => {
    console.error('Ride data reset failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
