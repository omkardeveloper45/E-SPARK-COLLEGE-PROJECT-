/**
 * E-SPARK Appointment Center
 * Exact user-selected appointment times with a live countdown.
 */
document.addEventListener('DOMContentLoaded', loadAppointments);

let appointmentTimer;
let liveReloadTimer;

async function loadAppointments() {
  if (!API.getToken()) {
    showToast('Please login to view appointments', 'error');
    setTimeout(() => window.location.href = '/login', 700);
    return;
  }
  try {
    const data = await API.get('/bookings');
    renderAppointments(data.success ? data.bookings : []);
  } catch (err) {
    const grid = document.getElementById('appointmentsGrid');
    if (grid) grid.innerHTML = `<div class="widget-card" style="grid-column:1/-1;text-align:center;padding:3rem;color:#EF4444;">${escapeHtml(err.message || 'Unable to load appointments')}</div>`;
  }
}

function appointmentWindow(booking) {
  const [a, b] = String(booking.timeSlot || '').split(' - ');
  return { start: new Date(`${booking.date}T${a}:00`), end: new Date(`${booking.date}T${b}:00`) };
}

function getState(booking) {
  if (booking.status === 'Cancelled') return 'cancelled';
  if (booking.status === 'Completed') return 'completed';
  if (booking.status === 'In Progress') return 'progress';
  const { start, end } = appointmentWindow(booking);
  const now = new Date();
  if (now >= start && now <= end) return 'ready';
  if (now < start) return 'upcoming';
  return 'expired';
}

function renderAppointments(bookings) {
  const grid = document.getElementById('appointmentsGrid');
  const summary = document.getElementById('appointmentSummary');
  if (!grid || !summary) return;

  const upcoming = bookings.filter(b => getState(b) === 'upcoming').length;
  const ready = bookings.filter(b => ['ready','progress'].includes(getState(b))).length;
  const completed = bookings.filter(b => ['Completed','Cancelled'].includes(b.status)).length;

  summary.innerHTML = `
    <div class="metric-card"><div class="icon-box">📅</div><div><div class="metric-val">${upcoming}</div><div class="metric-lbl">Upcoming</div></div></div>
    <div class="metric-card"><div class="icon-box">⚡</div><div><div class="metric-val">${ready}</div><div class="metric-lbl">Ready / Charging</div></div></div>
    <div class="metric-card"><div class="icon-box">✓</div><div><div class="metric-val">${completed}</div><div class="metric-lbl">Completed / Cancelled</div></div></div>`;

  if (!bookings.length) {
    grid.innerHTML = `<div class="widget-card" style="grid-column:1/-1;text-align:center;padding:4rem 2rem;"><div style="font-size:3.5rem;">📅</div><h2 style="margin:.75rem 0 .4rem;">No appointments yet</h2><p style="color:#64748B;margin-bottom:1.5rem;">Choose your own date, exact start time and charging duration.</p><a href="/booking" class="btn-primary">Book an Appointment</a></div>`;
    return;
  }

  grid.innerHTML = bookings.map(renderCard).join('');
  startLiveRefresh(bookings);
}

function renderCard(b) {
  const state = getState(b);
  const { start, end } = appointmentWindow(b);
  const stateInfo = {
    upcoming: ['Upcoming','status-confirmed'],
    ready: ['Ready to Charge','status-confirmed'],
    progress: ['Charging in Progress','status-progress'],
    completed: ['Completed','status-completed'],
    cancelled: ['Cancelled','status-completed'],
    expired: ['Expired','status-completed']
  }[state];

  let startButton;
  if (state === 'ready') startButton = `<button class="btn-primary" onclick="startAppointment('${escapeHtml(b.bookingId)}')">⚡ Start Charging Now</button>`;
  else if (state === 'progress') startButton = `<a class="btn-primary" href="/charging?bookingId=${encodeURIComponent(b.bookingId)}">⚡ View Live Charging</a>`;
  else startButton = `<button class="btn-outline start-disabled" disabled>🔒 Starts at ${to12(b.startTime || String(b.timeSlot).split(' - ')[0])}</button>`;

  const cancelButton = b.status === 'Confirmed' && state !== 'expired'
    ? `<button class="btn-outline" onclick="cancelAppointment('${escapeHtml(b._id)}')">Cancel</button>` : '';

  const countdown = state === 'upcoming'
    ? `<div class="countdown" data-start="${start.toISOString()}">⏳ Starts in <strong>${formatCountdown(start - new Date())}</strong></div>`
    : state === 'ready'
      ? `<div class="countdown" style="color:#047857;background:#ECFDF5;border-color:#A7F3D0;">🟢 Appointment is active now — charging can start.</div>`
      : state === 'progress'
        ? `<div class="countdown" style="color:#047857;background:#ECFDF5;border-color:#A7F3D0;">⚡ Live charging session is running.</div>`
        : '';

  return `<article class="appointment-card ${state === 'progress' ? 'progress' : state === 'completed' ? 'completed' : 'upcoming'}">
    <div class="appointment-top"><div><div style="font-size:.75rem;color:#64748B;font-weight:700;">${escapeHtml(b.bookingId)}</div><h3 style="font-size:1.15rem;font-weight:900;color:#0F172A;margin-top:.25rem;">${escapeHtml(b.stationName)}</h3></div><span class="appointment-status ${stateInfo[1]}">${stateInfo[0]}</span></div>
    <div style="color:#64748B;font-size:.82rem;">📍 ${escapeHtml(b.stationAddress || '')}</div>
    <div class="appointment-detail">
      <div><div class="detail-label">Date</div><div class="detail-value">📅 ${formatDate(b.date)}</div></div>
      <div><div class="detail-label">Appointment</div><div class="detail-value">🕐 ${formatSlot(b.timeSlot)}</div></div>
      <div><div class="detail-label">Duration</div><div class="detail-value">⏱ ${b.durationMinutes || durationFromSlot(b.timeSlot)} min</div></div>
      <div><div class="detail-label">Charger</div><div class="detail-value">⚡ ${escapeHtml(b.connectorType)}</div></div>
      <div><div class="detail-label">Vehicle</div><div class="detail-value">🚗 ${escapeHtml(b.vehicleNumber)}</div></div>
      <div><div class="detail-label">Rate</div><div class="detail-value">₹${Number(b.pricePerKwh || 18).toFixed(2)}/kWh</div></div>
    </div>
    ${countdown}
    <div class="appointment-actions" style="margin-top:1rem;">${startButton}${cancelButton}</div>
  </article>`;
}

async function startAppointment(bookingId) {
  const button = window.event?.currentTarget;
  if (button) { button.disabled = true; button.textContent = 'Starting live charging...'; }
  try {
    const data = await API.post('/charging/start', { bookingId, initialBattery: 25 });
    if (!data.success) throw new Error(data.message || 'Unable to start charging');
    showToast('⚡ Charging started at your appointment time. Live telemetry is now active.', 'success');
    window.location.href = `/charging?bookingId=${encodeURIComponent(bookingId)}`;
  } catch (err) {
    showToast(err.message || 'Charging cannot start yet', 'error');
    if (button) { button.disabled = false; button.textContent = '⚡ Start Charging Now'; }
  }
}

async function cancelAppointment(id) {
  if (!confirm('Cancel this appointment?')) return;
  try {
    const data = await API.put(`/bookings/${id}/cancel`, {});
    if (data.success) { showToast('Appointment cancelled', 'success'); loadAppointments(); }
  } catch (err) { showToast(err.message || 'Unable to cancel appointment', 'error'); }
}

function startLiveRefresh(bookings) {
  if (appointmentTimer) clearInterval(appointmentTimer);
  if (liveReloadTimer) clearInterval(liveReloadTimer);
  appointmentTimer = setInterval(() => {
    document.querySelectorAll('.countdown[data-start]').forEach(el => {
      const start = new Date(el.dataset.start);
      const remaining = start - new Date();
      el.innerHTML = remaining > 0 ? `⏳ Starts in <strong>${formatCountdown(remaining)}</strong>` : '🟢 Appointment is active now.';
    });
  }, 1000);
  liveReloadTimer = setInterval(loadAppointments, 5000);
}

function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (days) return `${days}d ${hours}h ${mins}m`;
  if (hours) return `${hours}h ${mins}m ${secs}s`;
  return `${mins}m ${String(secs).padStart(2,'0')}s`;
}
function formatDate(date) { return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
function formatDateTime(date) { return date.toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}); }
function formatSlot(slot) { const [a,b]=String(slot).split(' - '); return `${to12(a)} - ${to12(b)}`; }
function durationFromSlot(slot) { const [a,b]=String(slot).split(' - '); if(!a||!b)return 30; const [ah,am]=a.split(':').map(Number),[bh,bm]=b.split(':').map(Number); return (bh*60+bm)-(ah*60+am); }
function to12(t) { const [h,m]=String(t).split(':').map(Number); const suffix=h>=12?'PM':'AM'; const hour=h%12||12; return `${hour}:${String(m).padStart(2,'0')} ${suffix}`; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
