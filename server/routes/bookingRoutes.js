const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getBookingById, checkAvailability, cancelBooking } = require('../controllers/bookingController');
const { protectUser } = require('../middleware/authMiddleware');

router.post('/', protectUser, createBooking);
router.get('/', protectUser, getUserBookings);
router.get('/availability/check', protectUser, checkAvailability);
router.get('/:id', protectUser, getBookingById);
router.put('/:id/cancel', protectUser, cancelBooking);

module.exports = router;
