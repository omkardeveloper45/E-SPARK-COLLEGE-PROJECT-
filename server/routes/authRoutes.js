const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginAdmin, getMe } = require('../controllers/authController');
const { protectUser } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.get('/me', protectUser, getMe);

module.exports = router;
