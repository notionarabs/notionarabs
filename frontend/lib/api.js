import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://notion-arabs.onrender.com/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');

// Log the API URL for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL);
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Reduced to 10 seconds timeout for better UX
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token and check maintenance mode
api.interceptors.request.use(
  (config) => {
    // Check if maintenance mode is active (except for settings/public endpoint)
    if (typeof window !== 'undefined' &&
      window.isMaintenanceMode &&
      !config.url?.includes('/settings/public') &&
      !config.url?.includes('/health')) {
      return Promise.reject({
        response: {
          status: 503,
          data: {
            success: false,
            message: 'الموقع في وضع الصيانة حالياً',
            maintenanceMode: true
          }
        }
      });
    }

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
    const { response } = error;

    // Handle different error types
    if (response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        const Cookies = require('js-cookie');
        Cookies.remove('authToken');
        delete api.defaults.headers.common['Authorization'];
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login';
        }
      }
    } else if (response?.status === 403) {
      toast.error('ليس لديك صلاحية للوصول إلى هذا المورد');
    } else if (response?.status === 404) {
      toast.error('المورد المطلوب غير موجود');
    } else if (response?.status === 503) {
      // Don't show toast for maintenance mode - the MaintenanceMode component handles this
      if (!response.data?.maintenanceMode) {
        toast.error('الموقع في وضع الصيانة حالياً');
      }
    } else if (response?.status >= 500) {
      toast.error('خطأ في الخادم. يرجى المحاولة مرة أخرى');
    } else if (!response) {
      toast.error('خطأ في الاتصال. تحقق من اتصالك بالإنترنت');
    }

    return Promise.reject(error);
  }
);

// Optimized API methods with caching hints
export const apiMethods = {
  get: (url, config = {}) => api.get(url, {
    ...config,
    headers: {
      'Cache-Control': 'max-age=300',
      ...config.headers,
    },
  }),

  post: (url, data, config = {}) => api.post(url, data, config),

  put: (url, data, config = {}) => api.put(url, data, config),

  patch: (url, data, config = {}) => api.patch(url, data, config),

  delete: (url, config = {}) => api.delete(url, config),
};

export default api;
