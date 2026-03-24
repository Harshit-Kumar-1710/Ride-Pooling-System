const Booking = require('../models/Booking');
const Ride    = require('../models/Ride');

// POST /api/bookings — book a ride
const createBooking = async (req, res) => {
  try {
    const { rideId, pickupPoint, dropPoint } = req.body;
    if (!rideId || !pickupPoint || !dropPoint)
      return res.status(400).json({ message: 'All fields are required.' });

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });
    if (ride.status !== 'open')
      return res.status(400).json({ message: 'This ride is not available.' });
    if (ride.seatsAvailable <= 0)
      return res.status(400).json({ message: 'No seats available.' });
    if (ride.driverId.toString() === req.user.id)
      return res.status(400).json({ message: 'You cannot book your own ride.' });

    const alreadyBooked = await Booking.findOne({
      rideId, passengerId: req.user.id, status: 'confirmed'
    });
    if (alreadyBooked)
      return res.status(409).json({ message: 'You already booked this ride.' });

    const booking = await Booking.create({
      rideId,
      passengerId: req.user.id,
      pickupPoint,
      dropPoint
    });

    ride.seatsAvailable -= 1;
    if (ride.seatsAvailable === 0) ride.status = 'full';
    await ride.save();

    res.status(201).json({ message: 'Ride booked successfully.', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/bookings/:id — cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.passengerId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not your booking.' });
    if (booking.status === 'cancelled')
      return res.status(400).json({ message: 'Already cancelled.' });

    booking.status = 'cancelled';
    await booking.save();

    await Ride.findByIdAndUpdate(booking.rideId, {
      $inc: { seatsAvailable: 1 },
      status: 'open'
    });

    res.status(200).json({ message: 'Booking cancelled. Seat restored.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/bookings/mine — passenger's bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passengerId: req.user.id })
      .populate('rideId')
      .sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createBooking, cancelBooking, getMyBookings };