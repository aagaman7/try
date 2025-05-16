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

  // Auth Routes
  register: async (userData) => {
    try {
      return await api.post('auth/register', userData);
    } catch (error) {
      throw error.response?.data || new Error('Registration failed');
    }
  },

  login: async (credentials) => {
    try {
      return await api.post('auth/login', credentials);
    } catch (error) {
      throw error.response?.data || new Error('Login failed');
    }
  },

  // Package Routes
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
  
  createPackage: async (packageData) => {
    try {
      return await api.post('packages', packageData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to create package');
    }
  },
  
  updatePackage: async (packageId, packageData) => {
    try {
      return await api.put(`packages/${packageId}`, packageData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to update package');
    }
  },
  
  deletePackage: async (packageId) => {
    try {
      return await api.delete(`packages/${packageId}`);
    } catch (error) {
      throw error.response?.data || new Error('Failed to delete package');
    }
  },
  
  // Service Routes
  getServices: async () => {
    try {
      return await api.get('services');
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch services');
    }
  },
  
  createService: async (serviceData) => {
    try {
      return await api.post('services', serviceData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to create service');
    }
  },
  
  updateService: async (serviceId, serviceData) => {
    try {
      return await api.put(`services/${serviceId}`, serviceData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to update service');
    }
  },
  
  deleteService: async (serviceId) => {
    try {
      return await api.delete(`services/${serviceId}`);
    } catch (error) {
      throw error.response?.data || new Error('Failed to delete service');
    }
  },
  
  // Booking Routes
  createBooking: async (bookingData) => {
    try {
      return await api.post('bookings', bookingData);
    } catch (error) {
      console.log(error);
      throw error.response?.data || new Error('Failed to create booking');
    }
  },
  
  getUserBookings: async () => {
    try {
      return await api.get('bookings');
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch user bookings');
    }
  },
  
  upgradeMembership: async (bookingData) => {
    try {
      return await api.put('bookings/upgrade', bookingData);
    } catch (error) {
      console.log(error);
      throw error.response?.data || new Error('Failed to upgrade membership');
    }
  },
  
  checkAvailability: async (timeSlot) => {
    try {
      return await api.get(`bookings/check-availability?timeSlot=${timeSlot}`);
    } catch (error) {
      throw error.response?.data || new Error('Failed to check availability');
    }
  },
  
  // Discount Routes
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
  
  createDiscount: async (discountData) => {
    try {
      return await api.post('discounts', discountData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to create discount');
    }
  },
  
  updateDiscount: async (discountId, discountData) => {
    try {
      return await api.put(`discounts/${discountId}`, discountData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to update discount');
    }
  },
  
  deleteDiscount: async (discountId) => {
    try {
      return await api.delete(`discounts/${discountId}`);
    } catch (error) {
      throw error.response?.data || new Error('Failed to delete discount');
    }
  },

  // Dashboard Routes
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
  },

  // Trainer Routes
  getTrainers: async () => {
    try {
      return await api.get('trainers');
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch trainers');
    }
  },

  getTrainerById: async (trainerId) => {
    try {
      return await api.get(`trainers/${trainerId}`);
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch trainer details');
    }
  },

  bookTrainerSession: async (bookingData) => {
    try {
      return await api.post('trainers/book', bookingData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to book trainer session');
    }
  },

  getUserTrainerBookings: async () => {
    try {
      return await api.get('trainers/bookings/user');
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch your bookings');
    }
  },

  cancelTrainerBooking: async (bookingId) => {
    try {
      return await api.put(`trainers/bookings/${bookingId}/cancel`);
    } catch (error) {
      throw error.response?.data || new Error('Failed to cancel booking');
    }
  },

  // Admin Trainer Routes
  adminGetAllTrainers: async () => {
    try {
      return await api.get('trainers/admin/all');
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch all trainers');
    }
  },

  adminAddTrainer: async (trainerData) => {
    try {
      return await api.post('trainers/admin', trainerData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to add trainer');
    }
  },

  adminUpdateTrainer: async (trainerId, updateData) => {
    try {
      return await api.put(`trainers/admin/${trainerId}`, updateData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to update trainer');
    }
  },

  adminDeleteTrainer: async (trainerId) => {
    try {
      return await api.delete(`trainers/admin/${trainerId}`);
    } catch (error) {
      throw error.response?.data || new Error('Failed to delete trainer');
    }
  },

  adminAddTrainerAvailability: async (trainerId, availabilityData) => {
    try {
      return await api.post(`trainers/admin/${trainerId}/availability`, availabilityData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to update trainer availability');
    }
  },

  // Admin User Management Routes
  adminGetAllUsers: async () => {
    try {
      return await api.get('admin');
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch all users');
    }
  },

  adminGetUserProfile: async (userId) => {
    try {
      return await api.get(`admin/${userId}`);
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch user profile');
    }
  },

  adminUpdateUserRole: async (userId, roleData) => {
    try {
      return await api.put(`admin/${userId}/role`, roleData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to update user role');
    }
  },

  adminToggleUserStatus: async (userId, statusData) => {
    try {
      return await api.put(`admin/${userId}/status`, statusData);
    } catch (error) {
      throw error.response?.data || new Error('Failed to toggle user status');
    }
  },

  adminGetUserMembershipHistory: async (userId) => {
    try {
      return await api.get(`admin/${userId}/membership-history`);
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch user membership history');
    }
  },
    adminGetAllBookings: async (params = {}) => {
    try {
      let queryString = '';
      
      if (Object.keys(params).length > 0) {
        queryString = '?' + new URLSearchParams(params).toString();
      }
      
      return await api.get(`admin/getallbookings${queryString}`);
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch all bookings');
    }
  }
  
};

export default apiService;