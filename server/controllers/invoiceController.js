const { getStore } = require('../config/db');

const getUserInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const store = getStore();
    const invoices = store.invoices.filter(i => i.userId === userId || req.user.isAdmin);
    res.json({ success: true, count: invoices.length, invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = getStore();
    const invoice = store.invoices.find(i => i._id === id || i.invoiceNumber === id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getUserInvoices,
  getInvoiceById
};
