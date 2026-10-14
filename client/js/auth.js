/**
 * Authentication Module (User Login, Registration & Admin Auth)
 */

document.addEventListener('DOMContentLoaded', () => {
  initRegisterForm();
  initLoginForm();
  initAdminLoginForm();
});

function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const vehicleNumber = document.getElementById('regVehicleNumber').value.trim();
    const vehicleType = document.getElementById('regVehicleType').value;

    if (!name || !email || !password || !confirmPassword) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
      const data = await API.post('/auth/register', {
        name,
        email,
        phone,
        password,
        confirmPassword,
        vehicleNumber,
        vehicleType
      });

      if (data.success) {
        API.setToken(data.token);
        API.setUser(data.user);
        showToast('Account created successfully!', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
}

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      const data = await API.post('/auth/login', { email, password });

      if (data.success) {
        API.setToken(data.token);
        API.setUser(data.user);
        showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (err) {
      showToast(err.message || 'Invalid email or password', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login to E-SPARK';
    }
  });
}

function initAdminLoginForm() {
  const form = document.getElementById('adminLoginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    if (!email || !password) {
      showToast('Please enter admin credentials', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying Admin...';

    try {
      const data = await API.post('/auth/admin/login', { email, password });

      if (data.success) {
        API.setToken(data.token);
        API.setUser({ ...data.admin, role: 'Admin', isAdmin: true });
        showToast('Admin Authentication Successful!', 'success');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1000);
      }
    } catch (err) {
      showToast(err.message || 'Invalid Admin Credentials', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Access Admin Dashboard';
    }
  });
}
