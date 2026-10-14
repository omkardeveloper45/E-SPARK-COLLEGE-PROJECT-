const { getStore } = require('../config/db');

const getBookingWindow = (booking) => {
  const [startText, endText] = String(booking.timeSlot || '').split(' - ');
  const start = new Date(`${booking.date}T${startText}:00`);
  const end = new Date(`${booking.date}T${endText}:00`);
  return { start, end };
};

const refreshSessionTelemetry = (session, now = new Date()) => {
  const startedAt = new Date(session.startedAt);
  const durationSeconds = Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000));
  const kwRate = Number(session.kwRate || 60);
  const pricePerKwh = Number(session.pricePerKwh || 18);
  // Simulated live meter: energy grows from the actual elapsed time.
  const energyDeliveredKwh = Number(((kwRate * durationSeconds) / 3600).toFixed(2));
  session.durationSeconds = durationSeconds;
  session.energyDeliveredKwh = energyDeliveredKwh;
  session.currentCost = Number((energyDeliveredKwh * pricePerKwh).toFixed(2));
  const initialBattery = Number(session.initialBattery || 20);
  const batteryGain = energyDeliveredKwh * Number(session.batteryGainPerKwh || 2.0);
  session.batteryPercent = Math.min(Number(session.targetBatteryPercent || 90), Math.round(initialBattery + batteryGain));
  return session;
};

const startCharging = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, initialBattery } = req.body;
    const store = getStore();

    const existingSession = store.chargingSessions.find(s => s.userId === userId && s.status === 'Charging');
    if (existingSession) {
      refreshSessionTelemetry(existingSession);
      return res.json({ success: true, message: 'Resumed existing active charging session', session: existingSession });
    }

    const booking = store.bookings.find(b =>
      (b._id === bookingId || b.bookingId === bookingId) && b.userId === userId && b.status === 'Confirmed'
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Confirmed appointment not found. Please book an appointment first.' });

    const { start, end } = getBookingWindow(booking);
    const now = new Date();
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return res.status(400).json({ success: false, message: 'Invalid appointment date or time.' });
    if (now.getTime() < start.getTime()) {
      return res.status(400).json({ success: false, message: `Charging starts at ${booking.date} ${booking.timeSlot}. Please wait until your appointment time.` });
    }
    if (now.getTime() > end.getTime()) {
      return res.status(400).json({ success: false, message: 'This appointment has ended. Please book another appointment.' });
    }

    const sessionId = 'ESP-CS-' + Math.floor(1000 + Math.random() * 9000);
    const newSession = {
      _id: 'cs_' + Date.now(),
      sessionId,
      userId,
      bookingId: booking.bookingId,
      stationName: booking.stationName,
      connectorType: booking.connectorType,
      batteryPercent: Number(initialBattery) || 25,
      initialBattery: Number(initialBattery) || 25,
      targetBatteryPercent: 90,
      batteryGainPerKwh: 2,
      energyDeliveredKwh: 0,
      durationSeconds: 0,
      currentCost: 0,
      kwRate: Number(booking.chargerKw || 60),
      pricePerKwh: Number(booking.pricePerKwh || 18),
      status: 'Charging',
      startedAt: now.toISOString(),
      endedAt: null
    };
    store.chargingSessions.unshift(newSession);
    booking.status = 'In Progress';
    res.status(201).json({ success: true, message: 'Charging session started!', session: newSession });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getChargingTelemetry = async (req, res) => {
  try {
    const userId = req.user.id;
    const store = getStore();
    const requestedSessionId = req.query.sessionId;
    let session = requestedSessionId
      ? store.chargingSessions.find(s => (s.sessionId === requestedSessionId || s._id === requestedSessionId) && s.userId === userId)
      : store.chargingSessions.find(s => s.userId === userId && s.status === 'Charging') || store.chargingSessions.find(s => s.userId === userId);

    if (!session) return res.json({ success: true, active: false, session: null });

    if (session.status === 'Charging') {
      const booking = store.bookings.find(b => b.bookingId === session.bookingId || b._id === session.bookingId);
      refreshSessionTelemetry(session);
      if (booking) {
        const { end } = getBookingWindow(booking);
        if (new Date() >= end) {
          session.status = 'Completed';
          session.endedAt = new Date().toISOString();
          booking.status = 'Completed';
          refreshSessionTelemetry(session, new Date(end));
        }
      }
    }

    res.json({ success: true, active: session.status === 'Charging', session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const stopCharging = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.body;
    const store = getStore();
    const session = store.chargingSessions.find(s => (s._id === sessionId || s.sessionId === sessionId) && s.userId === userId && s.status === 'Charging');
    if (!session) return res.status(404).json({ success: false, message: 'No active charging session found to stop.' });
    refreshSessionTelemetry(session);
    session.status = 'Completed';
    session.endedAt = new Date().toISOString();
    const booking = store.bookings.find(b => b.bookingId === session.bookingId || b._id === session.bookingId);
    if (booking) booking.status = 'Completed';
    res.json({ success: true, message: 'Charging session stopped successfully!', session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { startCharging, getChargingTelemetry, stopCharging };
