import axios from 'axios';

// In production (VM), use relative URL since Nginx proxies /api/* requests
const AUTH_BASE_URL = process.env.REACT_APP_AUTH_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8081' : '');

const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

const authService = {
  register: async (fullName, email, password) => {
    const response = await authApi.post('/api/auth/register', { fullName, email, password });
    return response.data;
  },

  sendOtp: async (email) => {
    const response = await authApi.post('/api/auth/send-otp', { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await authApi.post('/api/auth/verify-otp', { email, otp });
    return response.data;
  },

  login: async (email, password) => {
    const response = await authApi.post('/api/auth/login', { email, password });
    return response.data;
  },

  validate: async (token) => {
    const response = await authApi.get('/api/auth/validate', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getToken: () => localStorage.getItem('auth_token'),
  getUser: () => {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },

  saveAuth: (data) => {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify({ fullName: data.fullName, email: data.email }));
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
};

export default authService;
