const { getStore } = require('../config/db');

const processPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, sessionId, paymentMethod, upiId, cardNumber, cardHolder } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: 'A completed charging session is required before payment.' });

    const store = getStore();
    const session = store.chargingSessions.find(s => s.sessionId === sessionId && s.userId === userId);
    if (!session) return res.status(404).json({ success: false, message: 'Charging session not found.' });
    if (session.status !== 'Completed') return res.status(400).json({ success: false, message: 'Complete the charging session before making payment.' });
    if (Number(session.currentCost || 0) <= 0) return res.status(400).json({ success: false, message: 'No charging cost is due for this session.' });

    const existingPayment = store.payments.find(p => p.sessionId === sessionId && p.status === 'Success');
    if (existingPayment) return res.status(409).json({ success: false, message: 'This charging session has already been paid.' });

    const booking = store.bookings.find(b => b.bookingId === (bookingId || session.bookingId) || b._id === (bookingId || session.bookingId)) || {};
    const user = store.users.find(u => u._id === userId) || {};
    const subtotal = Number(session.currentCost.toFixed(2));
    const gstAmount = Number((subtotal * 0.18).toFixed(2));
    const totalAmount = Number((subtotal + gstAmount).toFixed(2));
    const paymentId = 'ESP-PAY-' + Math.floor(100000 + Math.random() * 900000);
    const transactionId = 'TXN-' + Math.floor(100000000 + Math.random() * 900000000);

    const newPayment = {
      _id: 'pay_' + Date.now(), paymentId, userId,
      userName: user.name || 'EV User', bookingId: booking.bookingId || session.bookingId,
      sessionId, amount: totalAmount, method: paymentMethod || 'UPI', status: 'Success', transactionId,
      timestamp: new Date().toISOString()
    };
    store.payments.unshift(newPayment);

    const invoiceNumber = 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newInvoice = {
      _id: 'inv_' + Date.now(), invoiceNumber, paymentId, userId,
      userName: user.name || 'EV User', userEmail: user.email || '', userPhone: user.phone || '',
      vehicleNumber: booking.vehicleNumber || user.vehicleNumber || '', stationName: booking.stationName || session.stationName,
      appointmentDate: booking.date || '', appointmentTime: booking.timeSlot || '', connectorType: booking.connectorType || session.connectorType,
      chargingStartedAt: session.startedAt, chargingEndedAt: session.endedAt,
      chargingUnits: Number(session.energyDeliveredKwh.toFixed(2)), unitPrice: Number(session.pricePerKwh),
      paymentMethod: newPayment.method, transactionId,
      subtotal, gstAmount, totalAmount, date: new Date().toISOString().split('T')[0], status: 'Paid'
    };
    store.invoices.unshift(newInvoice);

    if (paymentMethod === 'E-SPARK Wallet') user.walletBalance = Math.max(0, (user.walletBalance || 500) - totalAmount);

    res.status(201).json({ success: true, message: 'Payment Successful!', payment: newPayment, invoice: newInvoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const store = getStore();
    const payments = store.payments.filter(p => p.userId === userId);
    res.json({ success: true, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { processPayment, getUserPayments };
