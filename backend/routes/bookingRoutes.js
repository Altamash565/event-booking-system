const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

router.post('/reserve', auth, bookingController.reserveSeats);
router.post('/bookings', auth, bookingController.confirmBooking);

module.exports = router;
