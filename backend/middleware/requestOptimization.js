/**
 * Request optimization middleware for better performance
 */

const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * Compression middleware for response optimization
 */
const compressionMiddleware = compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  // Compression level (1-9, where 9 is highest compression)
  level: 6,
  // Only compress these content types
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

/**
 * Security headers middleware
 */
const securityMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  // Hide X-Powered-By header
  hidePoweredBy: true,
  // Set HSTS headers
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Request size limiting middleware
 */
const requestSizeLimit = express.json({
  limit: '10mb', // Limit JSON payloads to 10MB
  verify: (req, res, buf, encoding) => {
    // Additional verification if needed
    if (buf.length > 10 * 1024 * 1024) { // 10MB
      throw new Error('Payload too large');
    }
  }
});

/**
 * URL encoding limit middleware
 */
const urlEncodedLimit = express.urlencoded({
  extended: true,
  limit: '10mb'
});

/**
 * Rate limiting middleware
 */
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      });
    }
  });
};

/**
 * Different rate limits for different endpoints
 */
const rateLimits = {
  // General API rate limit
  general: createRateLimit(15 * 60 * 1000, 100, 'تم تجاوز الحد المسموح من الطلبات العامة'),

  // Authentication endpoints
  auth: createRateLimit(15 * 60 * 1000, 5, 'تم تجاوز الحد المسموح من محاولات الدخول'),

  // Template creation
  templateCreation: createRateLimit(60 * 60 * 1000, 10, 'تم تجاوز الحد المسموح من إنشاء القوالب'),

  // Blog creation
  blogCreation: createRateLimit(60 * 60 * 1000, 5, 'تم تجاوز الحد المسموح من إنشاء المقالات'),

  // Rating submission
  rating: createRateLimit(60 * 60 * 1000, 50, 'تم تجاوز الحد المسموح من إرسال التقييمات'),

  // Search endpoints
  search: createRateLimit(60 * 1000, 30, 'تم تجاوز الحد المسموح من عمليات البحث'),

  // Download endpoints
  download: createRateLimit(60 * 60 * 1000, 100, 'تم تجاوز الحد المسموح من التحميلات')
};

/**
 * Request timing middleware
 */
const timingMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Log slow requests (>1 second)
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`);
    }

    // Add timing header for debugging
    res.set('X-Response-Time', `${duration}ms`);
  });

  next();
};

/**
 * Request sanitization middleware
 */
const sanitizationMiddleware = (req, res, next) => {
  // Remove null/undefined values from body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === null || req.body[key] === undefined) {
        delete req.body[key];
      }
    });
  }

  // Trim string values
  const trimStrings = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(trimStrings);
    }
    if (obj && typeof obj === 'object') {
      const trimmed = {};
      Object.keys(obj).forEach(key => {
        trimmed[key] = trimStrings(obj[key]);
      });
      return trimmed;
    }
    return obj;
  };

  if (req.body) {
    req.body = trimStrings(req.body);
  }

  next();
};

module.exports = {
  compressionMiddleware,
  securityMiddleware,
  requestSizeLimit,
  urlEncodedLimit,
  rateLimits,
  timingMiddleware,
  sanitizationMiddleware
};
