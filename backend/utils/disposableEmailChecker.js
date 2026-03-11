const dns = require('dns').promises;

// The "Safe List" of reputable providers
const allowedDomains = [
  'gmail.com', 'googlemail.com',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'yahoo.com', 'ymail.com', 'rocketmail.com',
  'proton.me', 'protonmail.com',
  'zoho.com', 'gmx.com', 'mail.com', 'yandex.com', 'yandex.ru',
  'windowslive.com', 'outlook.sa', 'hotmail.co.uk'
];

/**
 * Checks if an email is from a whitelisted reputable provider
 * @param {string} email - The email to check
 * @returns {boolean} - True if allowed, false if blocked
 */
const isAllowedEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;

  // Check if it's in our safe whitelist
  return allowedDomains.includes(domain);
};

// Keeping this for compatibility or advanced checks if needed
const isDisposableEmail = (email) => {
  return !isAllowedEmail(email);
};

/**
 * Validates if the email domain has valid MX records
 * @param {string} email 
 */
const hasValidMXRecord = async (email) => {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;

    const mxRecords = await Promise.race([
      dns.resolveMx(domain),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DNS Timeout')), 5000))
    ]);
    
    return mxRecords && mxRecords.length > 0;
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return false;
    }
    return true; 
  }
};

module.exports = {
  isAllowedEmail,
  isDisposableEmail,
  hasValidMXRecord
};
