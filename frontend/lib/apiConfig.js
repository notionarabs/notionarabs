// Centralized API configuration to eliminate duplication across files

/**
 * Get the API base URL based on environment
 * @returns {string} The API base URL
 */
export function getApiBaseUrl() {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return process.env.NODE_ENV === 'production'
    ? 'https://notion-arabs-fe5b3f214071.herokuapp.com/api'
    : 'http://127.0.0.1:5000/api';
}

/**
 * Get the full API URL for a specific endpoint
 * @param {string} endpoint - The API endpoint (e.g., '/templates')
 * @returns {string} The full API URL
 */
export function getApiUrl(endpoint) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
}
