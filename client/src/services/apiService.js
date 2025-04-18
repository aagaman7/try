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

  put: async (endpoint, data, token = null) => {
    try {
      const authToken = token || localStorage.getItem('token');
      const config = authToken
          ? { headers: { Authorization: `Bearer ${authToken}` } }
        : {};
       
      const response = await axios.put(`${API_BASE_URL}/${endpoint}`, data, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Something went wrong');
    }
  },

  delete: async (endpoint, token = null) => {
    try {
      const authToken = token || localStorage.getItem('token');
      const config = authToken
          ? { headers: { Authorization: `Bearer ${authToken}` } }
        : {};
       
      const response = await axios.delete(`${API_BASE_URL}/${endpoint}`, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Something went wrong');
    }
  },

  getPackages: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/packages`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch packages');
    }
  },
  
  getPackageById: async (packageId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/packages/${packageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch package details');
    }
  },
  
  getServices: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/services`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch services');
    }
  },
  
  getTrainers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainers`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch trainers');
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
  
  // Added function to get all discounts
  getAllDiscounts: async (params = {}) => {
    try {
      let queryString = '';
      
      if (Object.keys(params).length > 0) {
        queryString = '?' + new URLSearchParams(params).toString();
      }
      
      const response = await axios.get(`${API_BASE_URL}/discounts${queryString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch discounts');
    }
  }
};

export default apiService;