/**
 * Support & Help Center Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initSupportForm();
});

function initSupportForm() {
  const form = document.getElementById('supportForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('suppName').value.trim();
    const email = document.getElementById('suppEmail').value.trim();
    const category = document.getElementById('suppCategory').value;
    const subject = document.getElementById('suppSubject').value.trim();
    const message = document.getElementById('suppMessage').value.trim();

    if (!email || !subject || !message) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting Ticket...';

    try {
      const data = await API.post('/support/ticket', {
        name,
        email,
        category,
        subject,
        message
      });

      if (data.success) {
        showToast(data.message, 'success');
        form.reset();
      }
    } catch (err) {
      showToast(err.message || 'Ticket submission failed', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Support Ticket';
    }
  });
}
