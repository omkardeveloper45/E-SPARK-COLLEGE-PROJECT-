/**
 * E-SPARK Billing & Payment Controller
 * No default amount. Payment is unlocked only for a completed charging session.
 */
let paymentAmount = 0;
let paymentSubtotal = 0;
let paymentGst = 0;
let activeMethod = 'UPI';
let activeSession = null;

document.addEventListener('DOMContentLoaded', initBillingPage);

async function initBillingPage() {
  if (!API.getToken()) {
    showToast('Please login to process payments', 'error');
    setTimeout(() => window.location.href = '/login', 700);
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('sessionId');
  const noPayment = document.getElementById('billingNoPayment');
  const checkout = document.getElementById('billingCheckout');

  if (!sessionId) {
    if (noPayment) noPayment.style.display = 'block';
    return;
  }

  try {
    const data = await API.get(`/charging/telemetry?sessionId=${encodeURIComponent(sessionId)}`);
    if (!data.success || !data.session) throw new Error('Charging session not found.');
    activeSession = data.session;

    if (activeSession.status !== 'Completed') {
      if (noPayment) {
        noPayment.style.display = 'block';
        document.getElementById('billingNoPaymentTitle').textContent = 'Charging Still In Progress';
        document.getElementById('billingNoPaymentText').textContent = 'Finish your live charging session first. Your final amount will be calculated only after charging is stopped.';
      }
      return;
    }

    if (Number(activeSession.currentCost || 0) <= 0) {
      if (noPayment) noPayment.style.display = 'block';
      return;
    }

    if (noPayment) noPayment.style.display = 'none';
    if (checkout) checkout.style.display = 'block';

    paymentSubtotal = Number(activeSession.currentCost.toFixed(2));
    paymentGst = Number((paymentSubtotal * 0.18).toFixed(2));
    paymentAmount = Number((paymentSubtotal + paymentGst).toFixed(2));

    document.getElementById('billingSubtotalDisplay').textContent = `₹ ${paymentSubtotal.toFixed(2)}`;
    document.getElementById('billingGstDisplay').textContent = `₹ ${paymentGst.toFixed(2)}`;
    document.getElementById('billingTotalAmountDisplay').textContent = `₹ ${paymentAmount.toFixed(2)}`;
    document.getElementById('billingStationDisplay').textContent = activeSession.stationName || 'EV Charging Session';

    initMethodTabs();
    initPaymentForm();
  } catch (err) {
    if (noPayment) {
      noPayment.style.display = 'block';
      document.getElementById('billingNoPaymentText').textContent = err.message || 'Complete a charging session to generate a bill.';
    }
  }
}

function initMethodTabs() {
  document.querySelectorAll('.payment-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.payment-method-form').forEach(f => f.style.display = 'none');
      tab.classList.add('active');
      activeMethod = tab.dataset.method;
      const target = document.getElementById(`form-${activeMethod.toLowerCase()}`);
      if (target) target.style.display = 'block';
    });
  });
}

function initPaymentForm() {
  const form = document.getElementById('paymentCheckoutForm');
  if (!form || form.dataset.bound) return;
  form.dataset.bound = '1';
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!activeSession || activeSession.status !== 'Completed' || paymentAmount <= 0) {
      showToast('No payable completed charging session is available.', 'error');
      return;
    }
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = `Processing ₹ ${paymentAmount.toFixed(2)}...`;
    try {
      const data = await API.post('/payments/process', {
        bookingId: activeSession.bookingId,
        sessionId: activeSession.sessionId,
        paymentMethod: activeMethod,
        upiId: document.getElementById('upiIdInput')?.value || '',
        cardNumber: document.getElementById('cardNumberInput')?.value || ''
      });
      if (!data.success) throw new Error(data.message || 'Payment processing failed');
      showToast('🎉 Payment Successful!', 'success');
      openPaymentSuccessModal(data.payment, data.invoice);
    } catch (err) {
      showToast(err.message || 'Payment processing failed', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = `🔒 Pay ₹ ${paymentAmount.toFixed(2)} Securely`;
    }
  });
}

function openPaymentSuccessModal(payment, invoice) {
  document.getElementById('successPaymentId').textContent = payment.paymentId;
  document.getElementById('successTxnId').textContent = payment.transactionId;
  document.getElementById('successAmount').textContent = `₹ ${Number(payment.amount).toFixed(2)}`;
  document.getElementById('viewInvoiceBtn').href = `/invoice?id=${encodeURIComponent(invoice._id)}`;
  document.getElementById('paymentSuccessModal')?.classList.add('show');
}
