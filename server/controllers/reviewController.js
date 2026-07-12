const Review  = require('../models/Review');
const Ride    = require('../models/Ride');
const Booking = require('../models/Booking');
const User    = require('../models/User');

// POST /api/reviews
const postReview = async (req, res) => {
  try {
    const { rideId, toUserId, rating, comment } = req.body;

    if (!rideId || !toUserId || !rating) {
      return res.status(400).json({ message: 'rideId, toUserId, and rating are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    // Verify ride is completed
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });
    if (ride.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review completed rides.' });
    }

    // Verify user was part of this ride (as driver or passenger)
    const isDriver = ride.driverId.toString() === req.user.id;
    const booking = await Booking.findOne({
      rideId, passengerId: req.user.id, status: 'confirmed'
    });
    if (!isDriver && !booking) {
      return res.status(403).json({ message: 'You were not part of this ride.' });
    }

    // Cannot review yourself
    if (toUserId === req.user.id) {
      return res.status(400).json({ message: 'You cannot review yourself.' });
    }

    // Check for existing review
    const existing = await Review.findOne({ rideId, fromUserId: req.user.id, toUserId });
    if (existing) {
      return res.status(409).json({ message: 'You already reviewed this user for this ride.' });
    }

    const review = await Review.create({
      rideId,
      fromUserId: req.user.id,
      toUserId,
      rating: parseInt(rating),
      comment: comment?.trim() || ''
    });

    // Update the target user's running average rating
    const allReviews = await Review.find({ toUserId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(toUserId, {
      rating: parseFloat(avgRating.toFixed(1)),
      totalRatingCount: allReviews.length
    });

    res.status(201).json({ message: 'Review submitted.', review });

  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate review.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/reviews/user/:userId
const getReviewsForUser = async (req, res) => {
  try {
    const reviews = await Review.find({ toUserId: req.params.userId })
      .populate('fromUserId', 'name collegeId')
      .populate('rideId', 'origin destination departureTime')
      .sort({ createdAt: -1 });

    const avg = reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.status(200).json({ reviews, average: avg, total: reviews.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/reviews/ride/:rideId/check — check if user already reviewed
const checkReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      rideId: req.params.rideId,
      fromUserId: req.user.id
    });
    res.status(200).json({ reviewed: !!review, review });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { postReview, getReviewsForUser, checkReview };
