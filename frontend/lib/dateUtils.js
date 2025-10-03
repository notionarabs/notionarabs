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

  // Simple format: DD/MM/YYYY
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
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

/**
 * Formats time (hours:minutes) in Gregorian with Latin numerals
 * @param {string|Date} dateInput
 * @returns {string}
 */
export const formatTime = (dateInput) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  const options = { hour: '2-digit', minute: '2-digit', hour12: false };
  const localeCandidates = [
    'en-US',
    'en-GB'
  ];
  for (const locale of localeCandidates) {
    try {
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch (_) { }
  }
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};
