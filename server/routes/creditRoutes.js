const express = require('express');
const router = express.Router();
const { getMyBalance, getMyHistory } = require('../controllers/creditController');
const verifyToken = require('../middleware/auth');

router.get('/balance', verifyToken, getMyBalance);
router.get('/history', verifyToken, getMyHistory);

module.exports = router;