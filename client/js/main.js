/**
 * E-SPARK Main UI Controller
 * Manages global navbar, user session state, profile dropdown, and toast notifications
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  checkAuthSession();
});

function initNavbar() {
  const navContainer = document.querySelector('.nav-auth');
  if (!navContainer) return;

  const user = API.getUser();
  const token = API.getToken();

  if (user && token) {
    navContainer.innerHTML = `
      <div class="profile-dropdown-container">
        <button class="user-avatar-btn" id="profileDropdownBtn">
          <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}" alt="User Avatar" />
          <span class="font-bold text-sm text-slate-700">${user.name.split(' ')[0]}</span>
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg>
        </button>
        <div class="profile-dropdown-menu" id="profileDropdownMenu">
          <div class="dropdown-header">
            <div class="name">${user.name}</div>
            <div class="email">${user.email}</div>
          </div>
          <a href="/dashboard" class="dropdown-item">
            <span>⚡ My Dashboard</span>
          </a>
          <a href="/profile" class="dropdown-item">
            <span>👤 Profile Settings</span>
          </a>
          <a href="/booking" class="dropdown-item">
            <span>📍 My Bookings</span>
          </a>
          <a href="/appointments" class="dropdown-item">
            <span>📅 Appointments</span>
          </a>
          <a href="/billing" class="dropdown-item">
            <span>📄 Invoices & Bills</span>
          </a>
          ${user.role === 'Admin' || user.isAdmin ? `
            <a href="/admin" class="dropdown-item" style="color: #059669; font-weight: 700;">
              <span>🛡️ Admin Portal</span>
            </a>
          ` : ''}
          <div style="border-top: 1px solid #E2E8F0; margin: 0.25rem 0;"></div>
          <button class="dropdown-item text-red-600" id="logoutBtn" style="width: 100%; border: none; background: none;">
            <span>🚪 Logout</span>
          </button>
        </div>
      </div>
    `;

    // Dropdown toggle listener
    const btn = document.getElementById('profileDropdownBtn');
    const menu = document.getElementById('profileDropdownMenu');
    if (btn && menu) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        menu.classList.remove('show');
      });
    }

    // Logout listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        API.removeToken();
        API.removeUser();
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
          window.location.href = '/login';
        }, 800);
      });
    }
  } else {
    navContainer.innerHTML = `
      <a href="/login" class="btn-auth-outline">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
        Login / Register
      </a>
    `;
  }
}

async function checkAuthSession() {
  const token = API.getToken();
  if (!token) return;

  try {
    const data = await API.get('/auth/me');
    if (data.success && data.user) {
      API.setUser(data.user);
    }
  } catch (err) {
    console.warn('Session expired or invalid token');
  }
}

// Global Toast Notification Helper
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '⚠️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
