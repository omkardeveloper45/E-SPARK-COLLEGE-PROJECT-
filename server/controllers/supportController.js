const { getStore } = require('../config/db');

const submitTicket = async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Email, Subject, and Message are required' });
    }

    const store = getStore();
    const ticketId = 'TKT-' + Math.floor(1000 + Math.random() * 9000);

    const newTicket = {
      _id: 'tkt_' + Date.now(),
      ticketId,
      name: name || (req.user ? req.user.name : 'EV Customer'),
      email,
      subject,
      category: category || 'General Query',
      message,
      status: 'Open',
      priority: 'Normal',
      date: new Date().toISOString().split('T')[0]
    };

    store.supportTickets.unshift(newTicket);

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully! Ticket Reference ID: ' + ticketId,
      ticket: newTicket
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserTickets = async (req, res) => {
  try {
    const store = getStore();
    const userEmail = req.user ? req.user.email : '';
    const tickets = store.supportTickets.filter(t => t.email.toLowerCase() === userEmail.toLowerCase() || req.user.isAdmin);
    res.json({ success: true, count: tickets.length, tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  submitTicket,
  getUserTickets
};
