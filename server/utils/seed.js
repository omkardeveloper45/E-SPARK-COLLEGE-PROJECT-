const bcrypt = require('bcryptjs');
const { getStore } = require('../config/db');

const seedData = async () => {
  const store = getStore();

  // Seed default admin if empty
  if (store.admins.length === 0) {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    store.admins.push({
      _id: 'adm_001',
      name: 'System Administrator',
      email: 'admin@espark.com',
      password: adminPasswordHash,
      role: 'Super Admin',
      createdAt: new Date().toISOString()
    });
  }

  // Seed default demo user if empty
  if (store.users.length === 0) {
    const userPasswordHash = await bcrypt.hash('user123', 10);
    store.users.push({
      _id: 'usr_001',
      name: 'Rahul Sharma',
      email: 'rahul@espark.com',
      phone: '+91 98765 43210',
      password: userPasswordHash,
      vehicleNumber: 'MH-12-EV-2026',
      vehicleType: '4-Wheeler (Tata Nexon EV)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      walletBalance: 1250,
      createdAt: new Date().toISOString()
    });
  }

  // Seed Charging Stations
  if (store.stations.length === 0) {
    store.stations = [
      {
        _id: 'stn_001',
        name: 'City Center Fast Hub',
        address: 'Block C, Tech Corridor, Main MG Road, City Center',
        city: 'Mumbai',
        location: { lat: 19.076, lng: 72.8777 },
        distance: '2.4 km',
        totalChargers: 6,
        availableChargers: 4,
        pricePerKwh: 18,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
        status: 'Available',
        chargers: [
          { id: 'chg_101', type: 'CCS2 (DC Fast)', kw: 60, price: 18, status: 'Available' },
          { id: 'chg_102', type: 'CCS2 (DC Fast)', kw: 60, price: 18, status: 'Available' },
          { id: 'chg_103', type: 'Type 2 (AC Slow)', kw: 22, price: 14, status: 'Occupied' },
          { id: 'chg_104', type: 'CHAdeMO (DC)', kw: 50, price: 17, status: 'Available' },
          { id: 'chg_105', type: 'CCS2 Ultra', kw: 120, price: 22, status: 'Available' },
          { id: 'chg_106', type: 'Type 2 (AC Slow)', kw: 7.4, price: 12, status: 'Maintenance' }
        ]
      },
      {
        _id: 'stn_002',
        name: 'Green Avenue Charging Plaza',
        address: 'Plot 45, Green Avenue, Near Metro Gate 3',
        city: 'Mumbai',
        location: { lat: 19.088, lng: 72.885 },
        distance: '3.7 km',
        totalChargers: 4,
        availableChargers: 3,
        pricePerKwh: 16,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80',
        status: 'Available',
        chargers: [
          { id: 'chg_201', type: 'CCS2 (DC Fast)', kw: 60, price: 16, status: 'Available' },
          { id: 'chg_202', type: 'Type 2 (AC)', kw: 22, price: 14, status: 'Available' },
          { id: 'chg_203', type: 'Type 2 (AC)', kw: 11, price: 12, status: 'Occupied' },
          { id: 'chg_204', type: 'CCS2 (DC Fast)', kw: 60, price: 16, status: 'Available' }
        ]
      },
      {
        _id: 'stn_003',
        name: 'Tech Park Supercharge Point',
        address: 'Cyber Towers, IT Expressway, Sector 5',
        city: 'Mumbai',
        location: { lat: 19.112, lng: 72.899 },
        distance: '5.1 km',
        totalChargers: 8,
        availableChargers: 1,
        pricePerKwh: 20,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1558441719-67450807429f?auto=format&fit=crop&w=600&q=80',
        status: 'Busy',
        chargers: [
          { id: 'chg_301', type: 'CCS2 Ultra', kw: 150, price: 22, status: 'Occupied' },
          { id: 'chg_302', type: 'CCS2 Ultra', kw: 150, price: 22, status: 'Occupied' },
          { id: 'chg_303', type: 'CCS2 Fast', kw: 60, price: 20, status: 'Occupied' },
          { id: 'chg_304', type: 'CCS2 Fast', kw: 60, price: 20, status: 'Occupied' },
          { id: 'chg_305', type: 'Type 2 AC', kw: 22, price: 15, status: 'Available' },
          { id: 'chg_306', type: 'Type 2 AC', kw: 22, price: 15, status: 'Occupied' },
          { id: 'chg_307', type: 'CHAdeMO', kw: 50, price: 18, status: 'Occupied' },
          { id: 'chg_308', type: 'CCS2 Fast', kw: 60, price: 20, status: 'Occupied' }
        ]
      },
      {
        _id: 'stn_004',
        name: 'Expressway Eco Charge Station',
        address: 'Mile Marker 18, National Highway Bypass',
        city: 'Navi Mumbai',
        location: { lat: 19.033, lng: 73.029 },
        distance: '8.2 km',
        totalChargers: 5,
        availableChargers: 5,
        pricePerKwh: 17,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?auto=format&fit=crop&w=600&q=80',
        status: 'Available',
        chargers: [
          { id: 'chg_401', type: 'CCS2 (DC)', kw: 90, price: 18, status: 'Available' },
          { id: 'chg_402', type: 'CCS2 (DC)', kw: 90, price: 18, status: 'Available' },
          { id: 'chg_403', type: 'CHAdeMO', kw: 50, price: 16, status: 'Available' },
          { id: 'chg_404', type: 'Type 2 AC', kw: 22, price: 14, status: 'Available' },
          { id: 'chg_405', type: 'Type 2 AC', kw: 7.4, price: 12, status: 'Available' }
        ]
      }
    ];
  }

  // Seed Bookings
  if (store.bookings.length === 0) {
    store.bookings = [
      {
        _id: 'bk_1001',
        bookingId: 'ESP-BK-9842',
        userId: 'usr_001',
        userName: 'Rahul Sharma',
        stationId: 'stn_001',
        stationName: 'City Center Fast Hub',
        chargerId: 'chg_101',
        connectorType: 'CCS2 (DC Fast)',
        vehicleNumber: 'MH-12-EV-2026',
        date: new Date().toISOString().split('T')[0],
        timeSlot: '14:00 - 15:00',
        status: 'Confirmed',
        amount: 250,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        _id: 'bk_1002',
        bookingId: 'ESP-BK-9721',
        userId: 'usr_001',
        userName: 'Rahul Sharma',
        stationId: 'stn_002',
        stationName: 'Green Avenue Charging Plaza',
        chargerId: 'chg_201',
        connectorType: 'Type 2 (AC)',
        vehicleNumber: 'MH-12-EV-2026',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        timeSlot: '10:00 - 11:30',
        status: 'Completed',
        amount: 320,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];
  }

  // Seed Charging Sessions
  if (store.chargingSessions.length === 0) {
    store.chargingSessions = [
      {
        _id: 'cs_801',
        sessionId: 'ESP-CS-4091',
        userId: 'usr_001',
        bookingId: 'ESP-BK-9721',
        stationName: 'Green Avenue Charging Plaza',
        connectorType: 'Type 2 (AC)',
        batteryPercent: 88,
        energyDeliveredKwh: 20,
        durationSeconds: 2700,
        currentCost: 320,
        status: 'Completed',
        startedAt: new Date(Date.now() - 86400000).toISOString(),
        endedAt: new Date(Date.now() - 86400000 + 2700000).toISOString()
      }
    ];
  }

  // Seed Payments & Invoices
  if (store.payments.length === 0) {
    store.payments = [
      {
        _id: 'pay_701',
        paymentId: 'ESP-PAY-8821',
        userId: 'usr_001',
        userName: 'Rahul Sharma',
        bookingId: 'ESP-BK-9721',
        amount: 320,
        method: 'UPI (Google Pay)',
        status: 'Success',
        transactionId: 'TXN-998823101',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    store.invoices = [
      {
        _id: 'inv_501',
        invoiceNumber: 'INV-2026-0042',
        paymentId: 'ESP-PAY-8821',
        userId: 'usr_001',
        userName: 'Rahul Sharma',
        userEmail: 'rahul@espark.com',
        userPhone: '+91 98765 43210',
        vehicleNumber: 'MH-12-EV-2026',
        stationName: 'Green Avenue Charging Plaza',
        chargingUnits: 20,
        unitPrice: 16,
        subtotal: 320,
        gstAmount: 57.6,
        totalAmount: 377.6,
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        status: 'Paid'
      }
    ];
  }

  console.log('⚡ E-SPARK Demo Seed Data Loaded Successfully.');
};

module.exports = { seedData };
