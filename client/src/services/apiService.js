const API_BASE_URL = "http://localhost:5000/api";

const apiService = {
  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Something went wrong");
      return result;
    } catch (error) {
      throw error;
    }
  },

  get: async (endpoint, token = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Something went wrong");
      return result;
    } catch (error) {
      throw error;
    }
  },
  getPackages: async () => axios.get(`${API_BASE_URL}/packages`),
  getServices: async () => axios.get(`${API_BASE_URL}/services`),
  bookMembership: async (bookingData) => axios.post(`${API_BASE_URL}/bookings`, bookingData),
  checkAvailability: async (timeSlot) => axios.get(`${API_BASE_URL}/bookings/check-availability?timeSlot=${timeSlot}`),
  processPayment: async (paymentData) => axios.post(`${API_BASE_URL}/payments`, paymentData),
};

export default apiService;
