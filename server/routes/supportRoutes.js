const express = require('express');
const router = express.Router();
const { submitTicket, getUserTickets } = require('../controllers/supportController');
const { protectUser } = require('../middleware/authMiddleware');

router.post('/ticket', submitTicket);
router.get('/tickets', protectUser, getUserTickets);

module.exports = router;
