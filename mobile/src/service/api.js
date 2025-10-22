// src/services/api.js
import { API_ENDPOINTS } from '../config/api';

class ApiService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
  }

  async request(url, options = {}) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      console.log('🌐 API Request:', url);
      console.log('📦 Request body:', options.body);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      console.log('📥 Response status:', response.status);
      console.log('📥 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('❌ API Error:', url, error);
      throw error;
    }
  }

  // Auth APIs
  async login(email, password) {
    const response = await this.request(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // บันทึก token ถ้ามี
    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async register(name, email, password) {
    const response = await this.request(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    // บันทึก token ถ้ามี
    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async getProfile() {
    return this.request(API_ENDPOINTS.PROFILE);
  }

  async logout() {
    this.clearToken();
    // เรียก logout endpoint ถ้ามี
    // return this.request(API_ENDPOINTS.LOGOUT, { method: 'POST' });
  }

  // Trips APIs
  async getTrips() {
    return this.request(API_ENDPOINTS.TRIPS);
  }

  async getTripById(id) {
    return this.request(API_ENDPOINTS.TRIP_BY_ID(id));
  }

  async createTrip(tripData) {
    return this.request(API_ENDPOINTS.CREATE_TRIP, {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async updateTrip(id, tripData) {
    return this.request(API_ENDPOINTS.TRIP_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(tripData),
    });
  }

  async deleteTrip(id) {
    return this.request(API_ENDPOINTS.TRIP_BY_ID(id), {
      method: 'DELETE',
    });
  }

  // Bookings APIs
  async getBookings() {
    return this.request(API_ENDPOINTS.BOOKINGS);
  }

  async getBookingById(id) {
    return this.request(API_ENDPOINTS.BOOKING_BY_ID(id));
  }

  async createBooking(bookingData) {
    return this.request(API_ENDPOINTS.BOOKINGS, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  // Recommendations APIs
  async getRecommendations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString 
      ? `${API_ENDPOINTS.RECOMMENDATIONS}?${queryString}`
      : API_ENDPOINTS.RECOMMENDATIONS;
    
    return this.request(url);
  }

  // AI APIs (ถ้าเปิดใช้งาน)
  async chatWithAI(message, context = {}) {
    return this.request(API_ENDPOINTS.AI_CHAT, {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  async generateTrip(preferences) {
    return this.request(API_ENDPOINTS.AI_GENERATE, {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  // Health Check
  async healthCheck() {
    const url = API_ENDPOINTS.LOGIN.replace('/api/auth/login', '/');
    return this.request(url);
  }
}

// Export singleton instance
const apiService = new ApiService();

// Export แบบเดิมเพื่อความ backward compatible
export const api = {
  login: (email, password) => apiService.login(email, password),
  register: (name, email, password) => apiService.register(name, email, password),
  getProfile: () => apiService.getProfile(),
  logout: () => apiService.logout(),
  
  // Trips
  getTrips: () => apiService.getTrips(),
  getTripById: (id) => apiService.getTripById(id),
  createTrip: (tripData) => apiService.createTrip(tripData),
  updateTrip: (id, tripData) => apiService.updateTrip(id, tripData),
  deleteTrip: (id) => apiService.deleteTrip(id),
  
  // Bookings
  getBookings: () => apiService.getBookings(),
  createBooking: (bookingData) => apiService.createBooking(bookingData),
  
  // Recommendations
  getRecommendations: (params) => apiService.getRecommendations(params),
  
  // AI
  chatWithAI: (message, context) => apiService.chatWithAI(message, context),
  generateTrip: (preferences) => apiService.generateTrip(preferences),
  
  // Utils
  setToken: (token) => apiService.setToken(token),
  getToken: () => apiService.getToken(),
  clearToken: () => apiService.clearToken(),
  healthCheck: () => apiService.healthCheck(),
};

export default apiService;