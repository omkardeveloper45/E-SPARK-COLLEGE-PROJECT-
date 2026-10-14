/**
 * User Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
});

async function loadDashboardData() {
  const token = API.getToken();
  if (!token) {
    window.location.href = '/login';
    return;
  }

  try {
    const data = await API.get('/users/dashboard');
    if (!data.success) return;

    const stats = data.stats;

    // Update User Overview Info
    const user = API.getUser();
    if (user) {
      const nameEl = document.getElementById('dashUserName');
      const vehicleEl = document.getElementById('dashUserVehicle');
      const avatarEl = document.getElementById('dashUserAvatar');

      if (nameEl) nameEl.textContent = user.name;
      if (vehicleEl) vehicleEl.textContent = user.vehicleNumber || 'MH-12-EV-2026';
      if (avatarEl && user.avatar) avatarEl.src = user.avatar;
    }

    // Update Metrics
    const walletEl = document.getElementById('dashWalletBalance');
    const bookingsEl = document.getElementById('dashTotalBookings');
    const energyEl = document.getElementById('dashTotalEnergy');
    const spentEl = document.getElementById('dashTotalSpent');

    if (walletEl) walletEl.textContent = `₹ ${stats.walletBalance || 500}`;
    if (bookingsEl) bookingsEl.textContent = stats.totalBookings || 0;
    if (energyEl) energyEl.textContent = `${stats.totalKwhCharged || 0} kWh`;
    if (spentEl) spentEl.textContent = `₹ ${stats.totalSpent || 0}`;

    // Render Active Charging Session Banner
    const activeBox = document.getElementById('dashActiveSessionBox');
    if (activeBox) {
      if (stats.activeSession) {
        activeBox.innerHTML = `
          <div class="banner-green-card" style="margin-bottom: 1.5rem;">
            <div>
              <span class="badge-tag" style="background: rgba(255,255,255,0.2); color: #fff;">⚡ CHARGING IN PROGRESS</span>
              <h3 style="font-size: 1.4rem; font-weight: 800; margin-top: 0.5rem;">${stats.activeSession.stationName}</h3>
              <p style="opacity: 0.9; font-size: 0.9rem;">Connector: ${stats.activeSession.connectorType} • Battery: ${stats.activeSession.batteryPercent}%</p>
            </div>
            <div style="margin-top: 1rem; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 1.2rem; font-weight: 800;">₹ ${stats.activeSession.currentCost.toFixed(2)}</span>
              <a href="/charging" class="btn-primary" style="background: #fff; color: #059669;">View Live Telemetry →</a>
            </div>
          </div>
        `;
      } else {
        activeBox.innerHTML = '';
      }
    }

    // Render upcoming appointment banner
    const appointmentBox = document.getElementById('dashUpcomingAppointmentBox');
    if (appointmentBox) {
      const appt = stats.upcomingBooking;
      appointmentBox.innerHTML = appt ? `
        <div class="widget-card" style="margin-bottom:1.5rem;border-left:5px solid #059669;background:linear-gradient(135deg,#ECFDF5,#FFFFFF);">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
            <div>
              <span class="badge-tag">📅 NEXT APPOINTMENT</span>
              <h3 style="font-size:1.1rem;font-weight:800;color:#0F172A;margin:.45rem 0 .25rem;">${appt.stationName}</h3>
              <p style="color:#64748B;font-size:.85rem;margin:0;">${appt.date} • ${appt.timeSlot} • ${appt.connectorType || 'EV Charger'}</p>
            </div>
            <a href="/appointments" class="btn-outline">View Appointment →</a>
          </div>
        </div>` : '';
    }

    // Render Recent Bookings Table
    const bookingsTable = document.getElementById('dashRecentBookingsTable');
    if (bookingsTable) {
      if (stats.recentBookings && stats.recentBookings.length > 0) {
        bookingsTable.innerHTML = stats.recentBookings.map(b => `
          <tr>
            <td style="font-weight: 700;">${b.bookingId}</td>
            <td>📍 ${b.stationName}</td>
            <td>${b.date} (${b.timeSlot})</td>
            <td><span class="status-badge ${b.status === 'Confirmed' ? 'available' : 'busy'}">${b.status}</span></td>
            <td style="font-weight: 700;">₹ ${b.amount}</td>
            <td>
              <a href="/appointments" class="btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">View Appointment</a>
            </td>
          </tr>
        `).join('');
      } else {
        bookingsTable.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748B;">No recent bookings found. <a href="/booking" style="color: #059669; font-weight: 700;">Book a charging slot now</a></td></tr>`;
      }
    }
  } catch (err) {
    console.error('Failed to load dashboard stats', err);
  }
}
