const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./server/config/db');
const { seedData } = require('./server/utils/seed');

const authRoutes = require('./server/routes/authRoutes');
const userRoutes = require('./server/routes/userRoutes');
const stationRoutes = require('./server/routes/stationRoutes');
const bookingRoutes = require('./server/routes/bookingRoutes');
const chargingRoutes = require('./server/routes/chargingRoutes');
const paymentRoutes = require('./server/routes/paymentRoutes');
const invoiceRoutes = require('./server/routes/invoiceRoutes');
const adminRoutes = require('./server/routes/adminRoutes');
const supportRoutes = require('./server/routes/supportRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS & Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files
app.use('/uploads', express.static(path.join(__dirname, 'server/uploads')));

// Serve Client Static Web Assets
app.use(express.static(path.join(__dirname, 'client')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/charging', chargingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'E-SPARK EV Charging Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// HTML Page Route Handlers
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dashboard.html'));
});

app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'booking.html'));
});

app.get('/appointments', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'appointments.html'));
});

app.get('/charging', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'charging.html'));
});

app.get('/billing', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'billing.html'));
});

app.get('/invoice', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'invoice.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'profile.html'));
});

app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'support.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'contact.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'about.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'admin.html'));
});

// 404 Fallback Page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'client', '404.html'));
});

// Start Server
const startServer = async () => {
  await connectDB();
  await seedData();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`⚡ E-SPARK EV Charging Server Running on Port ${PORT}`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
};

startServer();
