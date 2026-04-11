const Ride    = require('../models/Ride');
const Booking = require('../models/Booking');
const { isOnRoute, getDetourDistance } = require('../services/mapsService');
const { scoreRide }                    = require('../services/scoringService');
const { awardCredits }                 = require('../services/creditService');

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const searchRides = async (req, res) => {
  try {
    const { pickupLat, pickupLng, pickupLabel,
            dropLat, dropLng, dropLabel, preferredTime } = req.body;

    if (!pickupLat || !pickupLng || !dropLat || !dropLng)
      return res.status(400).json({ message: 'Pickup and drop coordinates are required.' });

    const pickupCoords = { latitude: parseFloat(pickupLat), longitude: parseFloat(pickupLng) };
    const dropCoords   = { latitude: parseFloat(dropLat),   longitude: parseFloat(dropLng) };

    // Stage 1 — get all open rides with seats
    const openRides = await Ride.find({ status: 'open', seatsAvailable: { $gt: 0 } })
      .populate('driverId', 'name collegeId rating');

    // Stage 2 — hard filter: is passenger on the driver's route?
    const matchedRides = openRides.filter(ride => {
      const origin      = { latitude: ride.origin.latitude,      longitude: ride.origin.longitude };
      const destination = { latitude: ride.destination.latitude, longitude: ride.destination.longitude };
      return isOnRoute(origin, destination, pickupCoords, dropCoords);
    });

    // Stage 3 — soft filter: only apply time filter if passenger gave a preferred time
    const preferred = preferredTime ? new Date(preferredTime) : null;
    const timeFiltered = preferred ? matchedRides.filter(ride => {
      const diffMins = Math.abs(new Date(ride.departureTime) - preferred) / (1000 * 60);
      return diffMins <= 60;
    }) : matchedRides;

    // Stage 4 — remove rides posted by the searching user themselves
    const cleaned = timeFiltered.filter(
      ride => ride.driverId._id.toString() !== req.user.id
    );

    // Stage 5 — score and sort
    const now = preferred || new Date();
    const scored = cleaned.map(ride => {
      const origin      = { latitude: ride.origin.latitude,      longitude: ride.origin.longitude };
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

module.exports = { postRide, getAllRides, getMyRides, getRideById, cancelRide, completeRide, searchRides };