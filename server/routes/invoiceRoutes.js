const express = require('express');
const router = express.Router();
const { getUserInvoices, getInvoiceById } = require('../controllers/invoiceController');
const { protectUser } = require('../middleware/authMiddleware');

router.get('/', protectUser, getUserInvoices);
router.get('/:id', protectUser, getInvoiceById);

module.exports = router;
