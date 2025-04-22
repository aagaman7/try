import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data || 
      error.message || 
      'Something went wrong';
    
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(typeof errorMessage === 'string' ? new Error(errorMessage) : errorMessage);
  }
);

const apiService = {
  // Auth token management
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  },

  clearAuthToken: () => {
    delete api.defaults.headers.common.Authorization;
  },

  // Generic API methods
  post: async (endpoint, data, token = null) => {
    try {
      if (token) {
        // For one-time use of a specific token
        return await axios.post(`${API_BASE_URL}/${endpoint}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => response.data);
      }
      // Use the interceptor for regular calls
      return await api.post(endpoint, data);
    } catch (error) {
      throw error;
    }
  },

  get: async (endpoint, token = null) => {
    try {
      if (token) {
        // For one-time use of a specific token
        return await axios.get(`${API_BASE_URL}/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => response.data);
      }
      // Use the interceptor for regular calls
      return await api.get(endpoint);
    } catch (error) {
      throw error;
    }
  },

  put: async (endpoint, data, token = null) => {
    try {
      if (token) {
        // For one-time use of a specific token
        return await axios.put(`${API_BASE_URL}/${endpoint}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => response.data);
      }
      // Use the interceptor for regular calls
      return await api.put(endpoint, data);
    } catch (error) {
      throw error;
    }
  },

  delete: async (endpoint, token = null) => {
    try {
      if (token) {
        // For one-time use of a specific token
        return await axios.delete(`${API_BASE_URL}/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => response.data);
      }
      // Use the interceptor for regular calls
      return await api.delete(endpoint);
    } catch (error) {
      throw error;
    }
  },

  // Specific API endpoints
  getPackages: async () => {
    try {
      return await api.get('packages');
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch packages');
    }
  },
  
  getPackageById: async (packageId) => {
    try {
      return await api.get(`packages/${packageId}`);
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch package details');
    }
  },
  
  getServices: async () => {
    try {
      return await api.get('services');
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch services');
    }
  },
  
  getTrainers: async () => {
    try {
      return await api.get('trainers');
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch trainers');
    }
  },
  
  bookMembership: async (bookingData) => {
    try {
      return await api.post('bookings', bookingData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to book membership');
    }
  },
  

  
  checkAvailability: async (timeSlot) => {
    try {
      return await api.get(`bookings/check-availability?timeSlot=${timeSlot}`);
    } catch (error) {
      throw error.response?.data || new Error('Failed to check availability');
    }
  },
  
  getAllDiscounts: async (params = {}) => {
    try {
      let queryString = '';
      
      if (Object.keys(params).length > 0) {
        queryString = '?' + new URLSearchParams(params).toString();
      }
      
      return await api.get(`discounts${queryString}`);
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch discounts');
    }
  },

  // Dashboard specific endpoints
  getUserDashboard: async () => {
    try {
      return await api.get('dashboard');
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch dashboard information');
    }
  },

  cancelMembership: async () => {
    try {
      return await api.post('dashboard/cancel');
    } catch (error) {
      throw error.response?.data || new Error('Failed to cancel membership');
    }
  },

  freezeMembership: async (freezeData) => {
    try {
      return await api.post('dashboard/freeze', freezeData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to freeze membership');
    }
  },

  extendMembership: async (extensionData) => {
    try {
      return await api.post('dashboard/extend', extensionData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to extend membership');
    }
  }
};

export default apiService;