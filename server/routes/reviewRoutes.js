const express = require('express');
const router = express.Router();
const { postReview, getReviewsForUser, checkReview } = require('../controllers/reviewController');
const verifyToken = require('../middleware/auth');

router.post('/',                    verifyToken, postReview);
router.get('/user/:userId',         verifyToken, getReviewsForUser);
router.get('/ride/:rideId/check',   verifyToken, checkReview);

module.exports = router;
