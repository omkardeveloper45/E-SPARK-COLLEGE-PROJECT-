/**
 * Admin Portal Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  loadAdminDashboard();
});

async function loadAdminDashboard() {
  const token = API.getToken();
  const user = API.getUser();

  if (!token || !user || (!user.isAdmin && user.role !== 'Admin')) {
    showToast('Admin access required. Please login with admin credentials.', 'error');
    setTimeout(() => window.location.href = '/login', 1000);
    return;
  }

  try {
    const data = await API.get('/admin/dashboard');
    if (!data.success) return;

    renderMetrics(data.metrics);
    renderStationTable(data.stationStatus);
    renderUsersTable();
    renderBookingsTable(data.recentBookings);
    renderCharts(data.revenueChart, data.bookingChart);
  } catch (err) {
    console.error('Admin metrics failed to load', err);
  }
}

function renderMetrics(m) {
  const users = document.getElementById('admTotalUsers');
  const stations = document.getElementById('admTotalStations');
  const bookings = document.getElementById('admTotalBookings');
  const revenue = document.getElementById('admTotalRevenue');
  const todayAppointments = document.getElementById('admTodayAppointments');

  if (users) users.textContent = m.totalUsers;
  if (stations) stations.textContent = m.totalStations;
  if (bookings) bookings.textContent = m.totalBookings;
  if (revenue) revenue.textContent = `₹ ${m.totalRevenue}`;
  if (todayAppointments) todayAppointments.textContent = m.todaysAppointments || 0;
}

function renderStationTable(stations) {
  const table = document.getElementById('admStationStatusTable');
  if (!table || !stations) return;

  table.innerHTML = stations.map(s => `
    <tr>
      <td style="font-weight: 700;">${s.name}</td>
      <td>${s.city}</td>
      <td>${s.available}/${s.total} Available</td>
      <td><span class="status-badge ${s.status.toLowerCase() === 'available' ? 'available' : 'busy'}">${s.status}</span></td>
      <td>
        <button class="btn-outline" style="padding: 0.25rem 0.6rem; font-size: 0.8rem;" onclick="editStationModal('${s.id}')">Edit</button>
        <button class="btn-outline" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; border-color: #EF4444; color: #EF4444;" onclick="deleteStation('${s.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function renderUsersTable() {
  const table = document.getElementById('admUsersTable');
  if (!table) return;

  try {
    const data = await API.get('/admin/users');
    if (data.success && data.users) {
      table.innerHTML = data.users.map(u => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
              <div>
                <div style="font-weight: 700;">${u.name}</div>
                <div style="font-size: 0.75rem; color: #64748B;">${u.email}</div>
              </div>
            </div>
          </td>
          <td>${u.phone || 'N/A'}</td>
          <td>${u.vehicleNumber || 'MH-12-EV-2026'}</td>
          <td><span class="status-badge available">Active</span></td>
          <td>
            <button class="btn-outline" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; border-color: #EF4444; color: #EF4444;" onclick="deleteUser('${u._id}')">Remove</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load users list', err);
  }
}

function renderBookingsTable(bookings) {
  const table = document.getElementById('admBookingsTable');
  if (!table || !bookings) return;

  table.innerHTML = bookings.map(b => `
    <tr>
      <td style="font-weight: 700;">${b.bookingId}</td>
      <td>${b.userName || 'EV Driver'}</td>
      <td>${b.stationName}</td>
      <td>${b.date}</td>
      <td><span class="status-badge ${b.status === 'Confirmed' ? 'available' : 'busy'}">${b.status}</span></td>
      <td style="font-weight: 700;">₹ ${b.amount}</td>
    </tr>
  `).join('');
}

function renderCharts(revData, bookData) {
  const revContainer = document.getElementById('admRevenueChartBars');
  if (!revContainer || !revData) return;

  const maxRev = Math.max(...revData.map(r => r.revenue)) || 10000;

  revContainer.innerHTML = revData.map(r => {
    const heightPct = Math.min(100, Math.max(15, (r.revenue / maxRev) * 100));
    return `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.35rem; flex: 1;">
        <span style="font-size: 0.7rem; color: #64748B; font-weight: 700;">₹${(r.revenue/1000).toFixed(1)}k</span>
        <div style="width: 100%; max-width: 36px; background: linear-gradient(to top, #059669, #10B981); height: ${heightPct}px; border-radius: 6px 6px 0 0;"></div>
        <span style="font-size: 0.75rem; color: #475569; font-weight: 600;">${r.day}</span>
      </div>
    `;
  }).join('');
}

async function deleteStation(id) {
  if (!confirm('Are you sure you want to delete this charging station?')) return;
  try {
    const data = await API.delete(`/stations/${id}`);
    if (data.success) {
      showToast('Station deleted successfully', 'success');
      loadAdminDashboard();
    }
  } catch (err) {
    showToast(err.message || 'Failed to delete station', 'error');
  }
}

async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  try {
    const data = await API.delete(`/admin/users/${id}`);
    if (data.success) {
      showToast('User deleted', 'success');
      renderUsersTable();
    }
  } catch (err) {
    showToast(err.message || 'Failed to remove user', 'error');
  }
}

function openAddStationModal() {
  const modal = document.getElementById('addStationModal');
  if (modal) modal.classList.add('show');
}

function closeAddStationModal() {
  const modal = document.getElementById('addStationModal');
  if (modal) modal.classList.remove('show');
}

document.addEventListener('DOMContentLoaded', () => {
  const addForm = document.getElementById('addStationForm');
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('addStnName').value.trim();
      const address = document.getElementById('addStnAddress').value.trim();
      const city = document.getElementById('addStnCity').value.trim();
      const pricePerKwh = document.getElementById('addStnPrice').value;

      try {
        const data = await API.post('/stations', {
          name, address, city, pricePerKwh
        });
        if (data.success) {
          showToast('New EV Station added!', 'success');
          closeAddStationModal();
          loadAdminDashboard();
        }
      } catch (err) {
        showToast(err.message || 'Failed to add station', 'error');
      }
    });
  }
});
