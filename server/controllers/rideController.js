const Ride    = require('../models/Ride');
const Booking = require('../models/Booking');
const User    = require('../models/User');
const { isOnRoute, getDetourDistance } = require('../services/mapsService');
const { scoreRide }                    = require('../services/scoringService');
const { awardCredits }                 = require('../services/creditService');
const { sendRideCompleted, sendRideCancelledToPassengers } = require('../services/emailService');

const postRide = async (req, res) => {
  try {
    const { origin, destination, departureTime, seatsAvailable } = req.body;
    if (!origin || !destination || !departureTime || !seatsAvailable)
      return res.status(400).json({ message: 'All fields are required.' });

    const ride = await Ride.create({
      driverId: req.user.id,
      origin,
      destination,
      departureTime,
      seatsAvailable,
      seatsTotal: seatsAvailable
    });

    res.status(201).json({ message: 'Ride posted successfully.', ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'open' })
      .populate('driverId', 'name collegeId rating')
      .sort({ departureTime: 1 });
    res.status(200).json({ rides });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driverId: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json({ rides });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driverId', 'name collegeId rating');
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });
    res.status(200).json({ ride });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });
    if (ride.driverId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not your ride.' });
    if (ride.status === 'completed')
      return res.status(400).json({ message: 'Cannot cancel a completed ride.' });

    ride.status = 'cancelled';
    await ride.save();

    await Booking.updateMany(
      { rideId: ride._id, status: 'confirmed' },
      { status: 'cancelled' }
    );

    res.status(200).json({ message: 'Ride cancelled.' });

    // Notify passengers
    try {
      const bookings = await Booking.find({ rideId: ride._id });
      for (const b of bookings) {
        const passenger = await User.findById(b.passengerId);
        if (passenger?.personalEmail) sendRideCancelledToPassengers(passenger, ride);
      }
    } catch (emailErr) { console.error('Cancel ride email error:', emailErr.message); }
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });
    if (ride.driverId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not your ride.' });
    if (ride.status !== 'open' && ride.status !== 'full')
      return res.status(400).json({ message: 'Ride cannot be completed.' });

    const passengerCount = await Booking.countDocuments({
      rideId: ride._id,
      status: 'confirmed'
    });

    ride.status = 'completed';
    await ride.save();

    const creditResult = await awardCredits(req.user.id, passengerCount);

    res.status(200).json({
      message: 'Ride completed.',
      creditsAwarded: creditResult.awarded,
      newBalance: creditResult.newBalance
    });

    // Notify driver + passengers about completion
    try {
      const driver = await User.findById(req.user.id);
      if (driver?.personalEmail) sendRideCompleted(driver, ride);
      const bookings = await Booking.find({ rideId: ride._id, status: 'confirmed' });
      for (const b of bookings) {
        const passenger = await User.findById(b.passengerId);
        if (passenger?.personalEmail) sendRideCompleted(passenger, ride);
      }
    } catch (emailErr) { console.error('Complete ride email error:', emailErr.message); }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const searchRides = async (req, res) => {
  try {
    const {
      pickupLat, pickupLng, pickupLabel,
      dropLat, dropLng, dropLabel,
      preferredTime
    } = req.body;

    if (!pickupLat || !pickupLng || !dropLat || !dropLng)
      return res.status(400).json({ message: 'Pickup and drop coordinates are required.' });

    const pickupCoords = {
      latitude: parseFloat(pickupLat),
      longitude: parseFloat(pickupLng)
    };

    const dropCoords = {
      latitude: parseFloat(dropLat),
      longitude: parseFloat(dropLng)
    };

    const openRides = await Ride.find({
      status: 'open',
      seatsAvailable: { $gt: 0 }
    }).populate('driverId', 'name collegeId rating');

    // Route matching
    const matchedRides = openRides.filter(ride => {
      const origin = { latitude: ride.origin.latitude, longitude: ride.origin.longitude };
      const destination = { latitude: ride.destination.latitude, longitude: ride.destination.longitude };
      return isOnRoute(origin, destination, pickupCoords, dropCoords);
    });

    // Time filter — only apply if preferredTime is a valid full datetime
    let preferred = null;
    if (preferredTime && preferredTime.includes('T') && !preferredTime.includes('--')) {
      const parsed = new Date(preferredTime);
      if (!isNaN(parsed.getTime())) {
        preferred = parsed;
      }
    }

    const timeFiltered = preferred
      ? matchedRides.filter(ride => {
          const diffMins = Math.abs(new Date(ride.departureTime) - preferred) / (1000 * 60);
          return diffMins <= 1440; // 24-hour window
        })
      : matchedRides;

    // Self-filter — cannot book your own ride
    const cleaned = timeFiltered.filter(
      ride => ride.driverId._id.toString() !== req.user.id
    );

    const now = preferred || new Date();

    // Scoring
    const scored = cleaned.map(ride => {
      const origin = { latitude: ride.origin.latitude, longitude: ride.origin.longitude };
      const destination = { latitude: ride.destination.latitude, longitude: ride.destination.longitude };
      const detourDistance = getDetourDistance(origin, destination, pickupCoords, dropCoords);
      const score = scoreRide(
        { detourDistance, departureTime: ride.departureTime, driverRating: ride.driverId.rating },
        { preferredTime: now }
      );
      return { ...ride.toObject(), detourDistance, score };
    });

    scored.sort((a, b) => a.score - b.score);

    res.status(200).json({ rides: scored, total: scored.length });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── Recommended Rides ──
const getRecommendedRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      status: 'open',
      seatsAvailable: { $gt: 0 },
      driverId: { $ne: req.user.id }
    })
      .populate('driverId', 'name collegeId rating')
      .sort({ departureTime: 1 })
      .limit(5);

    res.status(200).json({ rides });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── Optimize Route ──
const optimizeRoute = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });

    const bookings = await Booking.find({ rideId: ride._id, status: 'confirmed' })
      .populate('passengerId', 'name');

    if (bookings.length === 0) {
      return res.status(200).json({ optimized: [], message: 'No bookings to optimize.' });
    }

    // Build waypoints: origin -> all pickups -> all drops -> destination
    const pickups = bookings.map(b => ({
      lat: b.pickupPoint.latitude,
      lng: b.pickupPoint.longitude,
      label: b.pickupPoint.label,
      passenger: b.passengerId?.name,
      type: 'pickup'
    }));
    const drops = bookings.map(b => ({
      lat: b.dropPoint.latitude,
      lng: b.dropPoint.longitude,
      label: b.dropPoint.label,
      passenger: b.passengerId?.name,
      type: 'drop'
    }));

    // Simple greedy nearest-neighbor ordering
    const allStops = [...pickups, ...drops];
    const ordered = [];
    let current = { lat: ride.origin.latitude, lng: ride.origin.longitude };
    const remaining = [...allStops];

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const d = Math.sqrt(
          Math.pow(remaining[i].lat - current.lat, 2) +
          Math.pow(remaining[i].lng - current.lng, 2)
        );
        if (d < nearestDist) {
          nearestDist = d;
          nearestIdx = i;
        }
      }
      const nearest = remaining.splice(nearestIdx, 1)[0];
      ordered.push(nearest);
      current = { lat: nearest.lat, lng: nearest.lng };
    }

    res.status(200).json({
      optimized: ordered,
      origin: { lat: ride.origin.latitude, lng: ride.origin.longitude, label: ride.origin.label },
      destination: { lat: ride.destination.latitude, lng: ride.destination.longitude, label: ride.destination.label },
      totalStops: ordered.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  postRide, getAllRides, getMyRides, getRideById,
  cancelRide, completeRide, searchRides, getRecommendedRides,
  optimizeRoute
};