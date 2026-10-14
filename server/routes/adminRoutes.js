const express = require('express');
const router = express.Router();
const { getAdminDashboardStats, getAllUsers, deleteUser } = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', protectAdmin, getAdminDashboardStats);
router.get('/users', protectAdmin, getAllUsers);
router.delete('/users/:id', protectAdmin, deleteUser);

module.exports = router;
