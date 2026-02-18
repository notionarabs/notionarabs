import axios from 'axios';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from './apiConfig';

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Reduced to 15 seconds for better UX
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create specialized instance for email operations with extended timeout
const emailApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Reduced to 30 seconds for bulk email operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token and check maintenance mode
api.interceptors.request.use(
  (config) => {
    // Add timestamp for performance monitoring
    config.metadata = { startTime: Date.now() };

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
  (response) => {
    // Log slow API responses for performance monitoring
    if (response.config.metadata?.startTime) {
      const duration = Date.now() - response.config.metadata.startTime;
      if (duration > 2000) {
        console.warn(`🐌 Slow API response: ${response.config.url} took ${duration}ms`);
      } else if (duration > 1000) {
        console.log(`⚠️ API response: ${response.config.url} took ${duration}ms`);
      }
    }
    return response;
  },
  (error) => {
    const { response } = error;

    // Log API error response times — skip /auth/me failures (expected when not logged in)
    if (error.config?.metadata?.startTime) {
      const duration = Date.now() - error.config.metadata.startTime;
      const isAuthCheck = error.config.url?.includes('/auth/me');
      if (!isAuthCheck) {
        console.error(`❌ API error: ${error.config.url} failed after ${duration}ms`);
      }
    }

    // Handle different error types
    if (response?.status === 401) {
      // Token expired or invalid — but don't redirect if this is just the auth check
      const isAuthCheck = error.config?.url?.includes('/auth/me');
      if (!isAuthCheck && typeof window !== 'undefined') {
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

// Add same interceptors to emailApi
emailApi.interceptors.request.use(
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

emailApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Handle different error types
    if (response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        const Cookies = require('js-cookie');
        Cookies.remove('authToken');
        delete emailApi.defaults.headers.common['Authorization'];
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
export { emailApi };
