// Utility functions for consistent date formatting across the application

/**
 * Formats a date string consistently for both server and client
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string in Arabic
 */
export const formatDate = (dateString) => {
  // Handle invalid dates
  if (!dateString) return '';

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateString);
    return '';
  }

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'gregory' // Force Gregorian calendar to prevent hydration issues
  };

  return date.toLocaleDateString('ar-SA', options);
};

/**
 * Formats a date string for "last updated" text
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string in Arabic
 */
export const formatLastUpdated = (dateString) => {
  return formatDate(dateString);
};

/**
 * Formats current date for "last updated" text
 * @returns {string} - Current date formatted in Arabic
 */
export const formatCurrentDate = () => {
  return formatDate(new Date().toISOString());
};
