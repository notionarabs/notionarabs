/**
 * Centralized error handling utility for consistent error responses
 */

/**
 * Handle and format API errors consistently
 * @param {Error} error - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} context - Context where the error occurred
 * @param {number} defaultStatus - Default HTTP status code
 */
const handleApiError = (error, req, res, context, defaultStatus = 500) => {
  // Log error details for debugging
  console.error(`${context} error:`, error.message);

  // In development, log more details
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      user: req.user ? req.user._id : 'No user',
      body: req.body,
      params: req.params,
      query: req.query
    });
  }

  // Determine appropriate status code
  let statusCode = defaultStatus;
  let message = 'خطأ في الخادم';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'بيانات غير صحيحة';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'معرف غير صحيح';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'البيانات موجودة مسبقاً';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'رمز الدخول غير صحيح';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'انتهت صلاحية رمز الدخول';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

/**
 * Handle validation errors from express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'بيانات غير صحيحة',
      errors: errors.array()
    });
  }

  next();
};

/**
 * Async error wrapper to catch async errors in route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Wrapped function that catches async errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Rate limiting error handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleRateLimitError = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.',
    retryAfter: req.rateLimit?.resetTime || 60
  });
};

module.exports = {
  handleApiError,
  handleValidationErrors,
  asyncHandler,
  handleRateLimitError
};
