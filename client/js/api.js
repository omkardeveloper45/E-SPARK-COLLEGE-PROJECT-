/**
 * E-SPARK API Client Module
 * Handles AJAX requests to Express backend with JWT authorization
 */

const API_BASE = '/api';

const API = {
  getToken: () => localStorage.getItem('espark_token'),
  
  setToken: (token) => localStorage.getItem('espark_token') ? localStorage.setItem('espark_token', token) : localStorage.setItem('espark_token', token),
  
  removeToken: () => localStorage.removeItem('espark_token'),

  getUser: () => {
    const data = localStorage.getItem('espark_user');
    return data ? JSON.parse(data) : null;
  },

  setUser: (user) => localStorage.setItem('espark_user', JSON.stringify(user)),

  removeUser: () => localStorage.removeItem('espark_user'),

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'API Request Failed');
      }
      return data;
    } catch (err) {
      console.error(`[API Error ${endpoint}]:`, err.message);
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  async uploadFile(endpoint, formData) {
    const token = this.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });
    return await res.json();
  }
};
