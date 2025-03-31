import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api";

const apiService = {
  post: async (endpoint, data, token = null) => {
    try {
      const authToken = token || localStorage.getItem('token');
      const config = authToken 
        ? { headers: { Authorization: `Bearer ${authToken}` } }
        : {};
      
      const response = await axios.post(`${API_BASE_URL}/${endpoint}`, data, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Something went wrong');
    }
  },

  get: async (endpoint, token = null) => {
    try {
      const authToken = token || localStorage.getItem('token');
      const config = authToken 
        ? { headers: { Authorization: `Bearer ${authToken}` } }
        : {};
      
      const response = await axios.get(`${API_BASE_URL}/${endpoint}`, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Something went wrong');
    }
  },

  getPackages: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/packages`);
      return response.data; // Return the actual data directly
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch packages');
    }
  },
  
  getServices: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/services`);
      return response.data; // Return the actual data directly
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch services');
    }
  },
  
  bookMembership: async (bookingData, token) => apiService.post(`bookings`, bookingData, token),
  
  checkAvailability: async (timeSlot) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/check-availability?timeSlot=${timeSlot}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to check availability');
    }
  },
  
  processPayment: async (paymentData, token) => apiService.post(`payments`, paymentData, token),
};

export default apiService;
