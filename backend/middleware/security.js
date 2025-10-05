const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Security headers with Helmet
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Compression middleware
const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024,
});

// Rate limiting
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for development and localhost
      const isDevelopment = process.env.NODE_ENV === 'development';
      const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
      const isLocalNetwork = req.ip?.startsWith('192.168.') || req.ip?.startsWith('10.') || req.ip?.startsWith('172.');
      const isTemplatesEndpoint = req.originalUrl?.includes('/templates') && req.method === 'GET';

      console.log('Rate limit check:', {
        NODE_ENV: process.env.NODE_ENV,
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
        skip: isDevelopment || isLocalhost || isLocalNetwork || isTemplatesEndpoint
      });

      return isDevelopment || isLocalhost || isLocalNetwork || isTemplatesEndpoint;
    }
  });
};

// General rate limit
const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  500, // limit each IP to 500 requests per windowMs (more generous)
  'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة مرة أخرى لاحقاً'
);

// Strict rate limit for auth endpoints
const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  20, // limit each IP to 20 requests per windowMs (more generous)
  'تم تجاوز الحد المسموح من محاولات تسجيل الدخول. يرجى المحاولة مرة أخرى لاحقاً'
);

// API rate limit
const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  2000, // limit each IP to 2000 requests per windowMs (more generous)
  'تم تجاوز الحد المسموح من طلبات API. يرجى المحاولة مرة أخرى لاحقاً'
);

module.exports = {
  securityHeaders,
  compressionMiddleware,
  generalRateLimit,
  authRateLimit,
  apiRateLimit,
};
