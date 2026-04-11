const express = require('express');
const router  = express.Router();
const {
  postRide, getAllRides, getMyRides,
  getRideById, cancelRide, completeRide, searchRides
} = require('../controllers/rideController');
const verifyToken = require('../middleware/auth');

router.post('/',              verifyToken, postRide);
router.get('/',               verifyToken, getAllRides);
router.get('/mine',           verifyToken, getMyRides);
router.post('/search',        verifyToken, searchRides);
router.get('/:id',            verifyToken, getRideById);
router.patch('/:id/cancel',   verifyToken, cancelRide);
router.patch('/:id/complete', verifyToken, completeRide);

module.exports = router;