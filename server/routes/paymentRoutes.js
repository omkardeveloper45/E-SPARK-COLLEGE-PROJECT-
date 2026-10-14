const express = require('express');
const router = express.Router();
const { processPayment, getUserPayments } = require('../controllers/paymentController');
const { protectUser } = require('../middleware/authMiddleware');

router.post('/process', protectUser, processPayment);
router.get('/', protectUser, getUserPayments);

module.exports = router;
