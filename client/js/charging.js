/**
 * E-SPARK Live Charging Telemetry
 * The meter is driven from the real elapsed session time and updates continuously.
 */
let telemetryInterval = null;
let activeSessionData = null;

document.addEventListener('DOMContentLoaded', initLiveChargingScreen);

async function initLiveChargingScreen() {
  if (!API.getToken()) {
    showToast('Please login to view live charging', 'error');
    setTimeout(() => window.location.href = '/login', 700);
    return;
  }
  const params = new URLSearchParams(window.location.search);
  await loadTelemetry(params.get('sessionId'));
}

async function loadTelemetry(sessionId = null) {
  try {
    const endpoint = sessionId ? `/charging/telemetry?sessionId=${encodeURIComponent(sessionId)}` : '/charging/telemetry';
    const data = await API.get(endpoint);
    if (data.success && data.session) {
      activeSessionData = data.session;
      updateUI(data.session);
      if (data.session.status === 'Charging') startTelemetryLoop();
      else stopTelemetryLoop();
    } else {
      showEmptyState();
    }
  } catch (err) {
    console.error('Error fetching telemetry', err);
    showEmptyState();
  }
}

function startTelemetryLoop() {
  stopTelemetryLoop();
  telemetryInterval = setInterval(async () => {
    try {
      const data = await API.get(activeSessionData?.sessionId ? `/charging/telemetry?sessionId=${encodeURIComponent(activeSessionData.sessionId)}` : '/charging/telemetry');
      if (data.success && data.session) {
        activeSessionData = data.session;
        updateUI(data.session);
        if (data.session.status !== 'Charging') stopTelemetryLoop();
      }
    } catch (err) { console.warn('Live telemetry error', err); }
  }, 1000);
}
function stopTelemetryLoop() { if (telemetryInterval) { clearInterval(telemetryInterval); telemetryInterval = null; } }

function updateUI(session) {
  const stationNameEl = document.getElementById('telemetryStationName');
  const connectorEl = document.getElementById('telemetryConnector');
  const batteryNumEl = document.getElementById('batteryPercentNum');
  const batteryCircleFill = document.getElementById('batteryCircleFill');
  const kwEl = document.getElementById('telemetryKwRate');
  const kwhEl = document.getElementById('telemetryEnergyKwh');
  const timeEl = document.getElementById('telemetryDuration');
  const costEl = document.getElementById('telemetryCurrentCost');
  const rateEl = document.getElementById('telemetryPricePerKwh');
  const statusEl = document.getElementById('telemetryLiveStatus');
  const actionBtn = document.getElementById('chargingActionBtn');

  if (stationNameEl) stationNameEl.textContent = session.stationName;
  if (connectorEl) connectorEl.textContent = `Connector: ${session.connectorType} • Session ID: ${session.sessionId}`;
  if (rateEl) rateEl.textContent = `₹ ${Number(session.pricePerKwh || 0).toFixed(2)}`;

  const pct = Math.min(100, Math.max(0, Number(session.batteryPercent || 0)));
  if (batteryNumEl) batteryNumEl.textContent = `${pct}%`;
  if (batteryCircleFill) {
    const radius = 90, circumference = 2 * Math.PI * radius;
    batteryCircleFill.style.strokeDasharray = `${circumference} ${circumference}`;
    batteryCircleFill.style.strokeDashoffset = circumference - (pct / 100) * circumference;
  }

  if (kwEl) kwEl.textContent = `${Number(session.kwRate || 0)} kW`;
  if (kwhEl) kwhEl.textContent = `${Number(session.energyDeliveredKwh || 0).toFixed(2)} kWh`;
  if (timeEl) {
    const secs = Math.max(0, Number(session.durationSeconds || 0));
    const hrs = Math.floor(secs / 3600), mins = Math.floor((secs % 3600) / 60), rem = secs % 60;
    timeEl.textContent = hrs ? `${hrs}h ${String(mins).padStart(2,'0')}m ${String(rem).padStart(2,'0')}s` : `${mins}m ${String(rem).padStart(2,'0')}s`;
  }
  if (costEl) costEl.textContent = `₹ ${Number(session.currentCost || 0).toFixed(2)}`;

  if (session.status === 'Charging') {
    if (statusEl) { statusEl.textContent = '● LIVE CHARGING'; statusEl.style.background='#ECFDF5'; statusEl.style.color='#047857'; }
    if (actionBtn) actionBtn.innerHTML = `<button class="btn-primary" onclick="stopChargingSession()" style="background:#DC2626;border-color:#DC2626;padding:.85rem 2rem;font-size:1rem;">🔴 Stop Charging & View Final Bill</button>`;
  } else if (session.status === 'Completed') {
    if (statusEl) { statusEl.textContent = '✓ CHARGING COMPLETED'; statusEl.style.background='#EFF6FF'; statusEl.style.color='#1D4ED8'; }
    if (actionBtn) actionBtn.innerHTML = `<a href="/billing?sessionId=${encodeURIComponent(session.sessionId)}&bookingId=${encodeURIComponent(session.bookingId)}" class="btn-primary">💳 Pay Final Bill ₹${(Number(session.currentCost || 0) * 1.18).toFixed(2)} →</a>`;
  }
}

async function stopChargingSession() {
  if (!activeSessionData) return;
  try {
    const data = await API.post('/charging/stop', { sessionId: activeSessionData.sessionId });
    if (!data.success) throw new Error(data.message || 'Unable to stop charging');
    stopTelemetryLoop();
    activeSessionData = data.session;
    updateUI(data.session);
    showToast('⚡ Charging completed. Your final bill is now calculated from actual energy delivered.', 'success');
    setTimeout(() => window.location.href = `/billing?sessionId=${encodeURIComponent(data.session.sessionId)}&bookingId=${encodeURIComponent(data.session.bookingId)}`, 1000);
  } catch (err) { showToast(err.message || 'Failed to stop session', 'error'); }
}

function showEmptyState() {
  const container = document.getElementById('chargingTelemetryWrapper');
  if (container) container.innerHTML = `<div style="text-align:center;padding:4rem 1.5rem;"><div style="font-size:3.5rem;margin-bottom:1rem;">🔌</div><h2 style="font-size:1.8rem;font-weight:800;color:#0F172A;margin-bottom:.5rem;">No Active Charging Session</h2><p style="color:#64748B;margin-bottom:2rem;">Open Appointments at your selected time and press Start Charging to begin the live meter.</p><a href="/appointments" class="btn-primary">📅 View My Appointment</a></div>`;
}
