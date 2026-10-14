const express = require('express');
const router = express.Router();
const { getStations, getStationById, createStation, updateStation, deleteStation } = require('../controllers/stationController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.get('/', getStations);
router.get('/:id', getStationById);
router.post('/', protectAdmin, createStation);
router.put('/:id', protectAdmin, updateStation);
router.delete('/:id', protectAdmin, deleteStation);

module.exports = router;
