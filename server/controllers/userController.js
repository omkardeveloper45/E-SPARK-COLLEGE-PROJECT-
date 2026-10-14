const bcrypt = require('bcryptjs');
const { getStore } = require('../config/db');

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, vehicleNumber, vehicleType, email } = req.body;
    const store = getStore();

    const userIndex = store.users.findIndex(u => u._id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) store.users[userIndex].name = name;
    if (phone) store.users[userIndex].phone = phone;
    if (vehicleNumber) store.users[userIndex].vehicleNumber = vehicleNumber;
    if (vehicleType) store.users[userIndex].vehicleType = vehicleType;

    const { password, ...updatedUser } = store.users[userIndex];
    res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const store = getStore();

    const user = store.users.find(u => u._id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const store = getStore();
    const user = store.users.find(u => u._id === userId);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const avatarUrl = `/uploads/${req.file.filename}`;
    user.avatar = avatarUrl;

    res.json({ success: true, message: 'Avatar updated successfully', avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const store = getStore();

    const userBookings = store.bookings.filter(b => b.userId === userId);
    const userSessions = store.chargingSessions.filter(s => s.userId === userId);
    const userPayments = store.payments.filter(p => p.userId === userId);
    const userInvoices = store.invoices.filter(i => i.userId === userId);
    const user = store.users.find(u => u._id === userId) || {};

    const activeSession = userSessions.find(s => s.status === 'Charging' || s.status === 'In Progress');
    const upcomingBooking = userBookings.find(b => { if (!['Confirmed','Booked'].includes(b.status)) return false; const start = new Date(`${b.date}T${String(b.timeSlot || '').split(' - ')[0]}:00`); return !Number.isNaN(start.getTime()) && start >= new Date(); });

    const totalKwhCharged = userSessions.reduce((acc, s) => acc + (s.energyDeliveredKwh || 0), 0);
    const totalSpent = userPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    res.json({
      success: true,
      stats: {
        totalBookings: userBookings.length,
        totalSessions: userSessions.length,
        totalKwhCharged: totalKwhCharged.toFixed(1),
        totalSpent: totalSpent.toFixed(2),
        walletBalance: user.walletBalance || 500,
        activeSession: activeSession || null,
        upcomingBooking: upcomingBooking || null,
        recentBookings: userBookings.slice(0, 5),
        recentSessions: userSessions.slice(0, 5),
        recentInvoices: userInvoices.slice(0, 5)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  updateProfile,
  updatePassword,
  uploadAvatar,
  getUserDashboardStats
};
