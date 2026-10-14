/**
 * E-SPARK Booking Controller
 * Users choose an exact start time and duration. There are no fixed/random slots.
 */

let selectedStation = null;
let slotAvailable = false;
let currentClockTimer = null;

function pad2(n) { return String(n).padStart(2, '0'); }
function localDateString(date = new Date()) { return `${date.getFullYear()}-${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`; }
function localTimeString(date = new Date()) { return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`; }

function buildTimeSlot(date, startTime, durationMinutes) {
  if (!date || !startTime || !durationMinutes) return '';
  const [h, m] = startTime.split(':').map(Number);
  const start = new Date(`${date}T${startTime}:00`);
  if (Number.isNaN(start.getTime())) return '';
  const end = new Date(start.getTime() + Number(durationMinutes) * 60000);
  // Do not allow a booking to cross midnight.
  if (end.getDate() !== start.getDate()) return '';
  return `${startTime} - ${pad2(end.getHours())}:${pad2(end.getMinutes())}`;
}

function updateCurrentTimeHint() {
  const hint = document.getElementById('currentTimeHint');
  if (!hint) return;
  const now = new Date();
  hint.textContent = `Current local time: ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}. Select this time or any later available time for today.`;
}

document.addEventListener('DOMContentLoaded', () => {
  loadStations();
  initSearchAndFilters();
  initBookingForm();
  updateCurrentTimeHint();
  currentClockTimer = setInterval(updateCurrentTimeHint, 1000);
});

async function loadStations(search = '', connector = '') {
  const grid = document.getElementById('stationsGrid');
  if (!grid) return;
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:#64748B;">Loading available charging stations...</div>`;
  try {
    let query = `/stations?search=${encodeURIComponent(search)}`;
    if (connector) query += `&connector=${encodeURIComponent(connector)}`;
    const data = await API.get(query);
    if (!data.success || !data.stations?.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#64748B;">No EV stations found matching criteria.</div>`;
      return;
    }
    grid.innerHTML = data.stations.map(stn => `
      <div class="widget-card" style="display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <img src="${stn.image}" alt="${stn.name}" style="width:100%;height:160px;object-fit:cover;border-radius:var(--radius-md);margin-bottom:1rem;" />
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem;">
            <span class="status-badge ${stn.status.toLowerCase()==='available'?'available':'busy'}">${stn.status}</span>
            <span style="font-size:.85rem;font-weight:700;color:#059669;">⭐ ${stn.rating} (${stn.distance})</span>
          </div>
          <h3 style="font-size:1.15rem;font-weight:800;color:#0F172A;margin-bottom:.35rem;">${stn.name}</h3>
          <p style="font-size:.85rem;color:#64748B;margin-bottom:1rem;">📍 ${stn.address}, ${stn.city}</p>
          <div style="background:#F8FAFC;border-radius:var(--radius-sm);padding:.75rem;margin-bottom:1rem;">
            <div style="font-size:.8rem;font-weight:700;color:#475569;margin-bottom:.35rem;">Available Chargers (${stn.availableChargers}/${stn.totalChargers})</div>
            <div style="display:flex;flex-wrap:wrap;gap:.4rem;">${stn.chargers.map(c => `<span style="font-size:.75rem;background:#E2E8F0;padding:.2rem .5rem;border-radius:4px;color:#1E293B;">${c.type} • ${c.kw}kW</span>`).join('')}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #E2E8F0;padding-top:1rem;">
          <div><span style="font-size:.75rem;color:#64748B;display:block;">Rate</span><span style="font-size:1.2rem;font-weight:800;color:#059669;">₹ ${stn.pricePerKwh}/kWh</span></div>
          <button class="btn-primary" onclick="openBookingModal('${stn._id}')">Book Appointment</button>
        </div>
      </div>`).join('');
  } catch (err) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:#EF4444;">Failed to load stations: ${err.message}</div>`;
  }
}

function initSearchAndFilters() {
  const searchInput = document.getElementById('stationSearchInput');
  const connectorFilter = document.getElementById('connectorFilter');
  searchInput?.addEventListener('input', () => loadStations(searchInput.value.trim(), connectorFilter?.value || ''));
  connectorFilter?.addEventListener('change', () => loadStations(searchInput?.value.trim() || '', connectorFilter.value));
}

async function openBookingModal(stationId) {
  const token = API.getToken();
  if (!token) {
    showToast('Please login to book a charging appointment', 'error');
    setTimeout(() => window.location.href = '/login', 700);
    return;
  }
  try {
    const data = await API.get(`/stations/${stationId}`);
    if (!data.success) return;
    selectedStation = data.station;
    document.getElementById('modalStationName').textContent = selectedStation.name;
    document.getElementById('modalStationAddress').textContent = selectedStation.address;
    const chargerSelect = document.getElementById('bookChargerSelect');
    chargerSelect.innerHTML = selectedStation.chargers.map(c => `<option value="${c.id}">${c.type} - ${c.kw}kW (₹${c.price}/kWh)</option>`).join('');
    const user = API.getUser();
    const vehicleInput = document.getElementById('bookVehicleNumber');
    if (vehicleInput && user?.vehicleNumber) vehicleInput.value = user.vehicleNumber;

    const dateInput = document.getElementById('bookDate');
    const timeInput = document.getElementById('bookStartTime');
    const now = new Date();
    dateInput.value = localDateString(now);
    dateInput.min = localDateString(now);
    timeInput.value = localTimeString(new Date(now.getTime() + 5 * 60000));
    setTimeMinimum();
    document.getElementById('bookDuration').value = '30';
    document.getElementById('bookingModal').classList.add('show');
    await updateSlotAvailability();
  } catch (err) {
    showToast(err.message || 'Error opening booking dialog', 'error');
  }
}

function closeBookingModal() { document.getElementById('bookingModal')?.classList.remove('show'); }

function setTimeMinimum() {
  const date = document.getElementById('bookDate')?.value;
  const time = document.getElementById('bookStartTime');
  if (!time) return;
  if (date === localDateString()) {
    const now = new Date();
    time.min = localTimeString(now);
    if (time.value && time.value < time.min) time.value = time.min;
  } else {
    time.removeAttribute('min');
  }
}

async function updateSlotAvailability() {
  if (!selectedStation) return;
  const date = document.getElementById('bookDate')?.value;
  const startTime = document.getElementById('bookStartTime')?.value;
  const durationMinutes = document.getElementById('bookDuration')?.value;
  const chargerId = document.getElementById('bookChargerSelect')?.value;
  const submitBtn = document.querySelector('#bookingModalForm button[type=submit]');
  const status = document.getElementById('bookingAvailabilityStatus');
  setTimeMinimum();
  const timeSlot = buildTimeSlot(date, startTime, durationMinutes);
  if (!date || !startTime || !durationMinutes || !chargerId || !timeSlot) {
    slotAvailable = false;
    if (status) { status.textContent = '⚠ Choose a valid date, start time and duration.'; status.style.color='#B91C1C'; status.style.background='#FEF2F2'; status.style.borderColor='#FECACA'; }
    if (submitBtn) submitBtn.disabled = true;
    return;
  }
  try {
    const data = await API.get(`/bookings/availability/check?stationId=${encodeURIComponent(selectedStation._id)}&chargerId=${encodeURIComponent(chargerId)}&date=${encodeURIComponent(date)}&timeSlot=${encodeURIComponent(timeSlot)}`);
    slotAvailable = !!data.available;
    if (status) {
      status.textContent = slotAvailable ? `✓ ${timeSlot} is available. This is an appointment only — charging starts at the selected time.` : '⚠ This charger is already booked during this time. Choose another time.';
      status.style.color = slotAvailable ? '#047857' : '#B91C1C';
      status.style.background = slotAvailable ? '#ECFDF5' : '#FEF2F2';
      status.style.borderColor = slotAvailable ? '#A7F3D0' : '#FECACA';
    }
    if (submitBtn) { submitBtn.disabled = !slotAvailable; submitBtn.textContent = slotAvailable ? '📅 Confirm Appointment' : 'Time Unavailable'; }
  } catch (err) {
    slotAvailable = false;
    if (status) { status.textContent = err.message || 'Could not check availability.'; status.style.color='#B91C1C'; status.style.background='#FEF2F2'; status.style.borderColor='#FECACA'; }
    if (submitBtn) submitBtn.disabled = true;
  }
}

function initBookingForm() {
  const form = document.getElementById('bookingModalForm');
  if (!form) return;
  ['bookDate','bookStartTime','bookDuration','bookChargerSelect'].forEach(id => document.getElementById(id)?.addEventListener('change', updateSlotAvailability));
  document.getElementById('bookDate')?.addEventListener('change', setTimeMinimum);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!selectedStation || !slotAvailable) { showToast('Please choose an available appointment time.', 'error'); return; }
    const date = document.getElementById('bookDate').value;
    const startTime = document.getElementById('bookStartTime').value;
    const durationMinutes = Number(document.getElementById('bookDuration').value);
    const timeSlot = buildTimeSlot(date, startTime, durationMinutes);
    const chargerId = document.getElementById('bookChargerSelect').value;
    const vehicleNumber = document.getElementById('bookVehicleNumber').value.trim();
    const selectedCharger = selectedStation.chargers.find(c => c.id === chargerId) || selectedStation.chargers[0];
    const submitBtn = form.querySelector('button[type=submit]');
    submitBtn.disabled = true; submitBtn.textContent = 'Reserving Appointment...';
    try {
      const data = await API.post('/bookings', {
        stationId: selectedStation._id,
        chargerId,
        connectorType: selectedCharger?.type || 'CCS2 (DC Fast)',
        vehicleNumber,
        date,
        startTime,
        durationMinutes,
        timeSlot,
        amount: 0
      });
      if (data.success) {
        showToast(`📅 Appointment Confirmed for ${timeSlot}. Charging starts at that time.`, 'success');
        closeBookingModal();
        setTimeout(() => window.location.href = '/appointments', 900);
      } else throw new Error(data.message || 'Booking failed');
    } catch (err) {
      showToast(err.message || 'Booking failed', 'error');
      submitBtn.disabled = false; submitBtn.textContent = '📅 Confirm Appointment';
      await updateSlotAvailability();
    }
  });
}
