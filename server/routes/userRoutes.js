const express = require('express');
const router = express.Router();
const { updateProfile, updatePassword, uploadAvatar, getUserDashboardStats } = require('../controllers/userController');
const { protectUser } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/dashboard', protectUser, getUserDashboardStats);
router.put('/profile', protectUser, updateProfile);
router.put('/password', protectUser, updatePassword);
router.post('/avatar', protectUser, upload.single('avatar'), uploadAvatar);

module.exports = router;
