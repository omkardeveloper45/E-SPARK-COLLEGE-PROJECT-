const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      default: ''
    },

    password: {
      type: String,
      required: true
    },

    vehicleNumber: {
      type: String,
      default: 'MH-12-EV-0000'
    },

    vehicleType: {
      type: String,
      default: '4-Wheeler'
    },

    avatar: {
      type: String,
      default: ''
    },

    walletBalance: {
      type: Number,
      default: 500
    },

    createdAt: {
      type: String,
      default: () => new Date().toISOString()
    }
  },
  {
    collection: 'users'
  }
);

module.exports = mongoose.model('User', userSchema);