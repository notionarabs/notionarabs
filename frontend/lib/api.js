import axios from 'axios';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from './apiConfig';

const API_BASE_URL = getApiBaseUrl();

const TIMEOUT = process.env.NODE_ENV === 'production' ? 45000 : 15000;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT, // Increased to 45 seconds to handle cold-starts and slow DB connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create specialized instance for email operations with extended timeout
const emailApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT * 2, // 90 seconds for bulk email operations in production
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

// Recursive function to normalize IDs (_id <-> id) across the entire response tree
// Helper to clean corrupted strings (recursive escaping/backslashes)
const cleanCorruptedString = (str) => {
  if (!str || typeof str !== 'string' || str.length < 2) return str;
  
  // If it doesn't look like escaped JSON or have multiple backslashes, skip
  if (!str.includes('\\') && !str.startsWith('[') && !str.startsWith('"')) return str;

  let current = str;
  let prev;
  let iterations = 0;

  while (iterations < 5) {
    prev = current;
    
    // 1. Strip massive backslash sequences early
    if (current.includes('\\\\\\\\')) {
      current = current.replace(/\\+/g, '\\');
    }

    // 2. Try to parse if it looks like JSON
    const trimmed = current.trim();
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'string') {
          current = parsed;
        } else if (Array.isArray(parsed)) {
          // If it's an array, return it so normalizeData can recurse on its elements
          return parsed.map(item => {
            if (typeof item === 'string') return cleanCorruptedString(item);
            return normalizeData(item);
          });
        } else if (parsed && typeof parsed === 'object') {
          return normalizeData(parsed);
        } else {
          break;
        }
      } catch (e) {
        // If parsing fails, try manual unescape of common issues
        current = current.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      }
    } else {
      // Not JSON-like, just unescape backslashes
      current = current.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }

    if (current === prev) break;
    iterations++;
  }

  // Final pass to remove trailing/leading junk often found in these corrupted strings
  return current.replace(/^"+|"+$/g, '').replace(/\\+$/g, '').trim();
};

const normalizeData = (obj) => {
  if (!obj || typeof obj !== 'object' || obj instanceof Date) {
    if (typeof obj === 'string') return cleanCorruptedString(obj);
    return obj;
  }
  
  if (Array.isArray(obj)) {
    let changed = false;
    const newArr = obj.map(item => {
      const normalized = normalizeData(item);
      if (normalized !== item) changed = true;
      return normalized;
    });
    return changed ? newArr : obj;
  }
  
  let changed = false;
  const newObj = { ...obj };
  
  // Ensure both id and _id exist
  if (newObj._id && !newObj.id) {
    newObj.id = newObj._id;
    changed = true;
  } else if (newObj.id && !newObj._id) {
    newObj._id = newObj.id;
    changed = true;
  }
  
  // Recursively normalize nested objects and clean strings
  for (const key in newObj) {
    if (Object.prototype.hasOwnProperty.call(newObj, key)) {
      const val = newObj[key];
      
      if (typeof val === 'string') {
        const cleaned = cleanCorruptedString(val);
        if (cleaned !== val) {
          newObj[key] = cleaned;
          changed = true;
        }
      } else if (val && typeof val === 'object' && !(val instanceof Date)) {
        const normalized = normalizeData(val);
        if (normalized !== val) {
          newObj[key] = normalized;
          changed = true;
        }
      }
    }
  }
  
  return changed ? newObj : obj;
};

// Add response interceptor to handle auth errors, data normalization, and retries
api.interceptors.response.use(
  (response) => {
    // Automatically normalize _id and id fields in the response data
    if (response.data) {
      response.data = normalizeData(response.data);
    }

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
  async (error) => {
    const { config, response } = error;

    // Retry logic for 5xx errors or network timeouts
    const maxRetries = 2;
    config.retryCount = config.retryCount || 0;

    if (config.retryCount < maxRetries && (!response || response.status >= 500)) {
      config.retryCount += 1;
      const delay = config.retryCount * 1000; // Linear backoff
      console.warn(`🔄 Retrying API request (${config.retryCount}/${maxRetries}): ${config.url} in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(config);
    }

    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Log API error response times — skip 401s and network errors (backend cold-starting)
    if (error.config?.metadata?.startTime) {
      const duration = Date.now() - error.config.metadata.startTime;
      const is401 = response?.status === 401;
      const isNetworkError = !response; // no response = backend unreachable/cold-starting
      if (!is401 && !isNetworkError) {
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
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
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
