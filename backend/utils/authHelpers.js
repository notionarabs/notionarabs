const jwt = require('jsonwebtoken');
const dns = require('dns').promises;

/**
 * Temporary in-memory storage for users who have signed up but not yet verified
 * their email. In production this should be Redis (survives restarts).
 */
const tempUserStorage = new Map();

/** Per-IP signup attempt tracking to throttle abuse */
const signupAttempts = new Map();
const MAX_SIGNUP_ATTEMPTS = 3;
const SIGNUP_ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Purge expired temp users every hour to avoid memory growth
setInterval(() => {
    const now = new Date();
    for (const [token, userData] of tempUserStorage.entries()) {
        if (userData.emailVerificationExpiry < now) {
            tempUserStorage.delete(token);
        }
    }
}, 60 * 60 * 1000);

/**
 * Resolve whether a domain has valid MX records.
 * Used to reject obviously fake email domains at signup.
 */
const validateEmailDomain = async (email) => {
    try {
        const domain = email.split('@')[1];
        if (!domain) return false;
        const mxRecords = await dns.resolveMx(domain);
        return mxRecords && mxRecords.length > 0;
    } catch {
        return false;
    }
};

/**
 * Sign a JWT for the given user ID (and optional email).
 * Expires in 7 days.
 */
const generateToken = (userId, email = null) => {
    const payload = { userId };
    if (email) payload.email = email;
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
};

module.exports = {
    tempUserStorage,
    signupAttempts,
    MAX_SIGNUP_ATTEMPTS,
    SIGNUP_ATTEMPT_WINDOW,
    validateEmailDomain,
    generateToken
};
