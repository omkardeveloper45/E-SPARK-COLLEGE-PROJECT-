const mongoose = require('mongoose');

// In-Memory Database Store for robust container operation if MongoDB daemon is not running
const memoryStore = {
  users: [],
  admins: [],
  stations: [],
  bookings: [],
  vehicles: [],
  chargingSessions: [],
  payments: [],
  invoices: [],
  notifications: [],
  supportTickets: []
};

let isConnectedToMongo = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/espark_db';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    isConnectedToMongo = true;
    console.log('⚡ MongoDB Connected Successfully via Mongoose!');
  } catch (err) {
    isConnectedToMongo = false;
    console.log('⚠ MongoDB Connection Failed.');
    console.log('MongoDB Error:', err.message);
    console.log('⚡ Running E-SPARK In-Memory High-Performance Database System.');
}
};

const getStore = () => memoryStore;
const isMongo = () => isConnectedToMongo;

module.exports = {
  connectDB,
  getStore,
  isMongo
};
