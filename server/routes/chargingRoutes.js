const express = require('express');
const router = express.Router();
const { startCharging, getChargingTelemetry, stopCharging } = require('../controllers/chargingController');
const { protectUser } = require('../middleware/authMiddleware');

router.post('/start', protectUser, startCharging);
router.get('/telemetry', protectUser, getChargingTelemetry);
router.post('/stop', protectUser, stopCharging);

module.exports = router;
