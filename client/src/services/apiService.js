import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api";

const apiService = {
  post: async (endpoint, data, token = null) => {
    try {
      const config = token 
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      
      const response = await axios.post(`${API_BASE_URL}/${endpoint}`, data, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Something went wrong');
    }
  },

  get: async (endpoint, token = null) => {
    try {
      const config = token 
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      
      const response = await axios.get(`${API_BASE_URL}/${endpoint}`, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Something went wrong');
    }
  },

  getPackages: async () => axios.get(`${API_BASE_URL}/packages`),
  getServices: async () => axios.get(`${API_BASE_URL}/services`),
  bookMembership: async (bookingData, token) => apiService.post(`bookings`, bookingData, token),
  checkAvailability: async (timeSlot) => axios.get(`${API_BASE_URL}/bookings/check-availability?timeSlot=${timeSlot}`),
  processPayment: async (paymentData, token) => apiService.post(`payments`, paymentData, token),
};

export default apiService;
