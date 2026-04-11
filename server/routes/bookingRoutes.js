const express = require('express');
const router  = express.Router();
const { createBooking, cancelBooking, getMyBookings } = require('../controllers/bookingController');
const verifyToken = require('../middleware/auth');

router.post('/',       verifyToken, createBooking);
router.get('/mine',    verifyToken, getMyBookings);
router.delete('/:id',  verifyToken, cancelBooking);

module.exports = router;