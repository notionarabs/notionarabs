const { RateLimiterMemory } = require('rate-limiter-flexible');

// Memory-based rate limiter for high-performance scenarios
const rateLimiterMemory = new RateLimiterMemory({
  keyPrefix: 'rl_memory',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  const cache = new Map();
  
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const key = `${req.originalUrl}_${req.user?.id || 'anonymous'}`;
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < duration * 1000) {
      res.set('X-Cache', 'HIT');
      return res.json(cached.data);
    }
    
    // Store original res.json
    const originalJson = res.json;
    
    // Override res.json to cache the response
    res.json = function(data) {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
      
      res.set('X-Cache', 'MISS');
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    };
    
    // Log slow requests
    if (duration > 1000) {
      console.warn('Slow request detected:', logData);
    } else {
      console.log('Request:', logData);
    }
  });
  
  next();
};

// Memory usage monitoring
const memoryMonitor = (req, res, next) => {
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
  };
  
  res.set('X-Memory-Usage', JSON.stringify(memUsageMB));
  
  // Warn if memory usage is high
  if (memUsageMB.heapUsed > 500) { // 500MB
    console.warn('High memory usage detected:', memUsageMB);
  }
  
  next();
};

// Response time optimization
const responseTimeOptimization = (req, res, next) => {
  const start = Date.now();
  
  // Store original methods
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;
  
  // Override res.send to add headers before sending
  res.send = function(data) {
    const duration = Date.now() - start;
    res.set('X-Response-Time', `${duration}ms`);
    
    // Add cache headers for static content
    if (req.originalUrl.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
    } else if (req.originalUrl.startsWith('/api/')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    
    return originalSend.call(this, data);
  };
  
  // Override res.json to add headers before sending
  res.json = function(data) {
    const duration = Date.now() - start;
    res.set('X-Response-Time', `${duration}ms`);
    
    // Add cache headers for static content
    if (req.originalUrl.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
    } else if (req.originalUrl.startsWith('/api/')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    
    return originalJson.call(this, data);
  };
  
  // Override res.end to add headers before ending
  res.end = function(data) {
    const duration = Date.now() - start;
    res.set('X-Response-Time', `${duration}ms`);
    
    // Add cache headers for static content
    if (req.originalUrl.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
    } else if (req.originalUrl.startsWith('/api/')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    
    return originalEnd.call(this, data);
  };
  
  next();
};

module.exports = {
  rateLimiterMemory,
  cacheMiddleware,
  requestLogger,
  memoryMonitor,
  responseTimeOptimization,
};
