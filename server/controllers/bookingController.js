const { getStore } = require('../config/db');

const parseTimeSlot = (date, timeSlot) => {
  const parts = String(timeSlot || '').split(' - ');
  if (parts.length !== 2) return null;
  const start = new Date(`${date}T${parts[0]}:00`);
  const end = new Date(`${date}T${parts[1]}:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null;
  return { start, end, startText: parts[0], endText: parts[1] };
};

const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stationId, chargerId, connectorType, vehicleNumber, date, timeSlot, startTime, durationMinutes } = req.body;

    if (!stationId || !date || (!timeSlot && !startTime)) {
      return res.status(400).json({ success: false, message: 'Station, date and appointment start time are required.' });
    }

    const store = getStore();
    const station = store.stations.find(s => s._id === stationId);
    if (!station) return res.status(404).json({ success: false, message: 'Charging station not found' });

    const charger = station.chargers.find(c => c.id === chargerId) || station.chargers[0];
    if (!charger) return res.status(400).json({ success: false, message: 'No charger is available at this station.' });

    const requestedDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(requestedDate.getTime())) return res.status(400).json({ success: false, message: 'Please select a valid appointment date.' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < today) return res.status(400).json({ success: false, message: 'Appointment date cannot be in the past.' });

    let finalTimeSlot = timeSlot;
    if (!finalTimeSlot && startTime) {
      const mins = Number(durationMinutes || 30);
      if (!Number.isInteger(mins) || mins < 15 || mins > 180) {
        return res.status(400).json({ success: false, message: 'Charging duration must be between 15 and 180 minutes.' });
      }
      const start = new Date(`${date}T${startTime}:00`);
      const end = new Date(start.getTime() + mins * 60000);
      if (Number.isNaN(start.getTime()) || end.getDate() !== start.getDate()) {
        return res.status(400).json({ success: false, message: 'Please choose a valid appointment time and duration.' });
      }
      const pad = n => String(n).padStart(2, '0');
      finalTimeSlot = `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())}`;
    }

    const slot = parseTimeSlot(date, finalTimeSlot);
    if (!slot) return res.status(400).json({ success: false, message: 'Please choose a valid appointment time.' });

    // Allow a booking to start now (or within a 60-second clock tolerance) so a customer can charge immediately.
    if (slot.start.getTime() < Date.now() - 60000) {
      return res.status(400).json({ success: false, message: 'This appointment time has already passed. Choose the current time or a future time.' });
    }

    // Prevent overlapping reservations for the same charger, not just identical text slots.
    const conflictingBooking = store.bookings.find(b => {
      if (b.stationId !== stationId || b.chargerId !== chargerId || ['Cancelled', 'Completed'].includes(b.status) || b.date !== date) return false;
      const existing = parseTimeSlot(b.date, b.timeSlot);
      return existing && slot.start < existing.end && slot.end > existing.start;
    });
    if (conflictingBooking) {
      return res.status(409).json({ success: false, message: 'This charger is already reserved during the selected time. Please choose another time.' });
    }

    const bookingId = 'ESP-BK-' + Math.floor(1000 + Math.random() * 9000);
    const user = store.users.find(u => u._id === userId) || {};
    const newBooking = {
      _id: 'bk_' + Date.now(),
      bookingId,
      userId,
      userName: user.name || req.user.name || 'EV User',
      stationId,
      stationName: station.name,
      stationAddress: station.address,
      chargerId: chargerId || charger.id,
      connectorType: connectorType || charger.type,
      vehicleNumber: vehicleNumber || user.vehicleNumber || 'MH-12-EV-2026',
      date,
      startTime: finalTimeSlot.split(' - ')[0],
      durationMinutes: Math.round((slot.end - slot.start) / 60000),
      timeSlot: finalTimeSlot,
      status: 'Confirmed',
      appointmentType: 'Charging Appointment',
      amount: 0,
      pricePerKwh: Number(charger.price || station.pricePerKwh || 18),
      chargerKw: Number(charger.kw || 60),
      createdAt: new Date().toISOString()
    };

    store.bookings.unshift(newBooking);
    res.status(201).json({ success: true, message: 'Charging appointment booked successfully!', booking: newBooking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const store = getStore();
    const bookings = store.bookings.filter(b => b.userId === userId);
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const store = getStore();
    const booking = store.bookings.find(b => b._id === req.params.id || b.bookingId === req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const checkAvailability = async (req, res) => {
  try {
    const { stationId, chargerId, date, timeSlot } = req.query;
    if (!stationId || !chargerId || !date || !timeSlot) {
      return res.status(400).json({ success: false, available: false, message: 'Station, charger, date and time are required.' });
    }
    const requested = parseTimeSlot(date, timeSlot);
    if (!requested) return res.status(400).json({ success: false, available: false, message: 'Invalid appointment time.' });
    if (requested.start.getTime() < Date.now() - 60000) {
      return res.json({ success: true, available: false, message: 'This time has already passed.' });
    }
    const store = getStore();
    const booking = store.bookings.find(b => {
      if (b.stationId !== stationId || b.chargerId !== chargerId || b.date !== date || ['Cancelled', 'Completed'].includes(b.status)) return false;
      const existing = parseTimeSlot(b.date, b.timeSlot);
      return existing && requested.start < existing.end && requested.end > existing.start;
    });
    res.json({ success: true, available: !booking, message: booking ? 'This charger is already reserved during this time.' : 'Appointment time is available.' });
  } catch (err) {
    res.status(500).json({ success: false, available: false, message: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const store = getStore();

    const booking = store.bookings.find(b => (b._id === id || b.bookingId === id) && (b.userId === userId || req.user.isAdmin));
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
    }

    booking.status = 'Cancelled';
    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  checkAvailability,
  cancelBooking
};
