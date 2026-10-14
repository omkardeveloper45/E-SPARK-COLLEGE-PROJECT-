const { getStore } = require('../config/db');

const getAdminDashboardStats = async (req, res) => {
  try {
    const store = getStore();

    const totalUsers = store.users.length;
    const totalStations = store.stations.length;
    const totalBookings = store.bookings.length;
    const totalSessions = store.chargingSessions.length;
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = store.bookings.filter(b => b.date === today && !['Cancelled', 'Completed'].includes(b.status)).length;

    const totalRevenue = store.payments
      .filter(p => p.status === 'Success')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const completedPayments = store.payments.filter(p => p.status === 'Success').length;
    const pendingPayments = store.payments.filter(p => p.status === 'Pending').length;

    // Revenue Chart data (Last 7 days dummy dataset + real aggregation)
    const revenueChart = [
      { day: 'Mon', revenue: 4200 },
      { day: 'Tue', revenue: 5800 },
      { day: 'Wed', revenue: 7100 },
      { day: 'Thu', revenue: 6400 },
      { day: 'Fri', revenue: 8900 },
      { day: 'Sat', revenue: 11200 },
      { day: 'Sun', revenue: 13500 + totalRevenue }
    ];

    const bookingChart = [
      { day: 'Mon', count: 24 },
      { day: 'Tue', count: 32 },
      { day: 'Wed', count: 41 },
      { day: 'Thu', count: 38 },
      { day: 'Fri', count: 52 },
      { day: 'Sat', count: 68 },
      { day: 'Sun', count: 75 + totalBookings }
    ];

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalStations,
        totalBookings,
        totalSessions,
        todaysAppointments,
        totalRevenue: totalRevenue.toFixed(2),
        completedPayments,
        pendingPayments,
        availableChargers: store.stations.reduce((acc, s) => acc + s.availableChargers, 0),
        totalChargers: store.stations.reduce((acc, s) => acc + s.totalChargers, 0)
      },
      recentUsers: store.users.slice(0, 5),
      recentBookings: store.bookings.slice(0, 5),
      recentPayments: store.payments.slice(0, 5),
      stationStatus: store.stations.map(s => ({
        id: s._id,
        name: s.name,
        city: s.city,
        total: s.totalChargers,
        available: s.availableChargers,
        status: s.status
      })),
      revenueChart,
      bookingChart
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const store = getStore();
    const users = store.users.map(({ password, ...u }) => u);
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const store = getStore();
    const index = store.users.findIndex(u => u._id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });
    store.users.splice(index, 1);
    res.json({ success: true, message: 'User deleted by admin' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAdminDashboardStats,
  getAllUsers,
  deleteUser
};
