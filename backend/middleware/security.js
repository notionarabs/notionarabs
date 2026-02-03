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
      connectSrc: ["'self'", "https://notion-arabs.onrender.com", "https://notion-arabs-fe5b3f214071.herokuapp.com", "https://api.brevo.com", "https://www.google-analytics.com", "https://www.googletagmanager.com", "http://localhost:5000", "http://127.0.0.1:5000"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://player.vimeo.com", "https://www.dailymotion.com", "https://player.twitch.tv"],
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
      const isGoogleOAuthCallback = req.originalUrl?.includes('/auth/google/callback');

      return isDevelopment || isLocalhost || isLocalNetwork || isTemplatesEndpoint || isGoogleOAuthCallback;
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
  50, // limit each IP to 50 requests per windowMs (increased for OAuth)
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
