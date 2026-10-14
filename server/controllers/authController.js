const bcrypt = require('bcryptjs');
const { getStore } = require('../config/db');
const { generateToken } = require('../utils/jwt');
const User = require('../models/user');
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, vehicleNumber, vehicleType } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

   const existingUser = await User.findOne({
    email: email.toLowerCase()
});

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: 'usr_' + Date.now(),
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password: hashedPassword,
      vehicleNumber: vehicleNumber || 'MH-12-EV-0000',
      vehicleType: vehicleType || '4-Wheeler',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      walletBalance: 500, // Welcome bonus
      createdAt: new Date().toISOString()
    };

   await User.create(newUser);

    const token = generateToken({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: 'User'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        vehicleNumber: newUser.vehicleNumber,
        vehicleType: newUser.vehicleType,
        avatar: newUser.avatar,
        walletBalance: newUser.walletBalance
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const store = getStore();
    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'User'
    });

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        vehicleNumber: user.vehicleNumber,
        vehicleType: user.vehicleType,
        avatar: user.avatar,
        walletBalance: user.walletBalance
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const store = getStore();
    const admin = store.admins.find(a => a.email.toLowerCase() === email.toLowerCase());

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
    }

    const token = generateToken({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'Admin',
      isAdmin: true
    });

    res.json({
      success: true,
      message: 'Admin Authentication Successful!',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const store = getStore();
    if (req.user.isAdmin || req.user.role === 'Admin') {
      const admin = store.admins.find(a => a._id === req.user.id);
      return res.json({ success: true, user: admin, role: 'Admin' });
    }
    const user = store.users.find(u => u._id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { password, ...userData } = user;
    res.json({ success: true, user: userData, role: 'User' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  getMe
};
