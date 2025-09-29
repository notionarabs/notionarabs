import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://notion-arabs.onrender.com/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Token will be added by AuthContext
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      if (typeof window !== 'undefined') {
        const Cookies = require('js-cookie');
        Cookies.remove('authToken');
        delete api.defaults.headers.common['Authorization'];
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Payment API functions
export const paymentAPI = {
  // Create payment intent
  createPaymentIntent: (paymentData) => api.post('/payments/create-intent', paymentData),

  // Confirm payment
  confirmPayment: (paymentId, gatewayData) => api.post('/payments/confirm', { paymentId, gatewayData }),

  // Get payment history
  getPaymentHistory: (page = 1, limit = 10) => api.get(`/payments/history?page=${page}&limit=${limit}`),

  // Get creator earnings
  getCreatorEarnings: () => api.get('/payments/earnings'),

  // Process payout request
  processPayout: (amount) => api.post('/payments/payout', { amount }),

  // Get supported countries
  getSupportedCountries: () => api.get('/payments/supported-countries')
};

export default api;
