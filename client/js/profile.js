/**
 * User Profile Settings Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  initProfileForm();
  initAvatarUpload();
  initPasswordForm();
});

async function loadProfile() {
  const token = API.getToken();
  if (!token) {
    window.location.href = '/login';
    return;
  }

  try {
    const data = await API.get('/auth/me');
    if (data.success && data.user) {
      const u = data.user;
      const nameInput = document.getElementById('profName');
      const emailInput = document.getElementById('profEmail');
      const phoneInput = document.getElementById('profPhone');
      const vehNumInput = document.getElementById('profVehicleNumber');
      const vehTypeInput = document.getElementById('profVehicleType');
      const avatarImg = document.getElementById('profAvatarImage');

      if (nameInput) nameInput.value = u.name || '';
      if (emailInput) emailInput.value = u.email || '';
      if (phoneInput) phoneInput.value = u.phone || '';
      if (vehNumInput) vehNumInput.value = u.vehicleNumber || '';
      if (vehTypeInput) vehTypeInput.value = u.vehicleType || '4-Wheeler';
      if (avatarImg && u.avatar) avatarImg.src = u.avatar;
    }
  } catch (err) {
    showToast('Failed to load profile', 'error');
  }
}

function initProfileForm() {
  const form = document.getElementById('profileDetailsForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('profName').value.trim();
    const phone = document.getElementById('profPhone').value.trim();
    const vehicleNumber = document.getElementById('profVehicleNumber').value.trim();
    const vehicleType = document.getElementById('profVehicleType').value;

    try {
      const data = await API.put('/users/profile', {
        name,
        phone,
        vehicleNumber,
        vehicleType
      });

      if (data.success) {
        API.setUser(data.user);
        showToast('Profile details updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Profile update failed', 'error');
    }
  });
}

function initAvatarUpload() {
  const input = document.getElementById('avatarFileInput');
  if (!input) return;

  input.addEventListener('change', async () => {
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const data = await API.uploadFile('/users/avatar', formData);
      if (data.success && data.avatar) {
        const avatarImg = document.getElementById('profAvatarImage');
        if (avatarImg) avatarImg.src = data.avatar;

        const user = API.getUser();
        if (user) {
          user.avatar = data.avatar;
          API.setUser(user);
        }
        showToast('Profile photo updated!', 'success');
      }
    } catch (err) {
      showToast('Failed to upload avatar image', 'error');
    }
  });
}

function initPasswordForm() {
  const form = document.getElementById('profilePasswordForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    try {
      const data = await API.put('/users/password', { currentPassword, newPassword });
      if (data.success) {
        showToast('Password changed successfully!', 'success');
        form.reset();
      }
    } catch (err) {
      showToast(err.message || 'Password change failed', 'error');
    }
  });
}
