// src/services/authService.js
import api from './api';

const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  },

  getToken() {
    return localStorage.getItem('token');
  }
};

export default authService;