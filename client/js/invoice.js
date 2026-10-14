/**
 * Invoice View & PDF Generation Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  loadInvoiceDetails();
});

async function loadInvoiceDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceId = urlParams.get('id');

  try {
    let endpoint = '/invoices';
    if (invoiceId) endpoint += `/${invoiceId}`;

    const data = await API.get(endpoint);
    let invoice = null;

    if (data.success) {
      if (Array.isArray(data.invoices) && data.invoices.length > 0) {
        invoice = data.invoices[0];
      } else if (data.invoice) {
        invoice = data.invoice;
      }
    }

    if (!invoice) {
      showDefaultInvoice();
      return;
    }

    renderInvoiceUI(invoice);
  } catch (err) {
    console.warn('Error loading invoice data', err);
    showDefaultInvoice();
  }
}

function renderInvoiceUI(inv) {
  const invNum = document.getElementById('invNumber');
  const invDate = document.getElementById('invDate');
  const userName = document.getElementById('invUserName');
  const userEmail = document.getElementById('invUserEmail');
  const userVehicle = document.getElementById('invUserVehicle');
  const stationName = document.getElementById('invStationName');
  const units = document.getElementById('invUnits');
  const rate = document.getElementById('invRate');
  const subtotal = document.getElementById('invSubtotal');
  const lineAmount = document.getElementById('invLineAmount');
  const gst = document.getElementById('invGst');
  const total = document.getElementById('invTotal');
  const appointmentDate = document.getElementById('invAppointmentDate');
  const appointmentTime = document.getElementById('invAppointmentTime');
  const connector = document.getElementById('invConnector');
  const paymentMethod = document.getElementById('invPaymentMethod');
  const transaction = document.getElementById('invTransaction');

  if (invNum) invNum.textContent = inv.invoiceNumber;
  if (invDate) invDate.textContent = inv.date;
  if (userName) userName.textContent = inv.userName;
  if (userEmail) userEmail.textContent = inv.userEmail;
  if (userVehicle) userVehicle.textContent = inv.vehicleNumber;
  if (stationName) stationName.textContent = inv.stationName;
  if (units) units.textContent = `${inv.chargingUnits} kWh`;
  if (rate) rate.textContent = `₹ ${inv.unitPrice}/kWh`;
  if (subtotal) subtotal.textContent = `₹ ${inv.subtotal.toFixed(2)}`;
  if (lineAmount) lineAmount.textContent = `₹ ${inv.subtotal.toFixed(2)}`;
  if (gst) gst.textContent = `₹ ${inv.gstAmount.toFixed(2)}`;
  if (total) total.textContent = `₹ ${inv.totalAmount.toFixed(2)}`;
  if (appointmentDate) appointmentDate.textContent = inv.appointmentDate ? formatInvoiceDate(inv.appointmentDate) : 'Charging appointment';
  if (appointmentTime) appointmentTime.textContent = inv.appointmentTime || 'Time slot';
  if (connector) connector.textContent = inv.connectorType || 'CCS2 (DC Fast)';
  if (paymentMethod) paymentMethod.textContent = inv.paymentMethod || 'UPI';
  if (transaction) transaction.textContent = inv.transactionId || 'Transaction ID';
}

function formatInvoiceDate(value) {
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
}

function showDefaultInvoice() {
  const container = document.querySelector('.page-container');
  if (container) {
    container.innerHTML = `<div class="widget-card" style="max-width:760px;margin:3rem auto;text-align:center;padding:4rem 2rem;">
      <div style="font-size:3rem;margin-bottom:1rem;">🧾</div>
      <h2 style="font-size:1.6rem;font-weight:900;color:#0F172A;margin-bottom:.5rem;">No Invoice Available</h2>
      <p style="color:#64748B;margin-bottom:1.5rem;">An invoice is generated only after a completed charging session is paid successfully.</p>
      <a href="/appointments" class="btn-primary">📅 View Appointments</a>
    </div>`;
  }
}

function printInvoice() {
  window.print();
}

function downloadInvoicePDF() {
  showToast('📄 Use the print dialog and choose “Save as PDF” to download your invoice.', 'success');
  setTimeout(() => window.print(), 800);
}
