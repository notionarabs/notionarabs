const { performance } = require('perf_hooks');

// Performance monitoring class
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTimes = new Map();
  }

  // Start timing a process
  start(label) {
    this.startTimes.set(label, performance.now());
  }

  // End timing and record metrics
  end(label) {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(`No start time found for label: ${label}`);
      return;
    }

    const duration = performance.now() - startTime;
    this.recordMetric(label, duration);
    this.startTimes.delete(label);
    
    return duration;
  }

  // Record a metric
  recordMetric(label, value) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, {
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity,
        values: []
      });
    }

    const metric = this.metrics.get(label);
    metric.count++;
    metric.total += value;
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);
    metric.values.push(value);

    // Keep only last 100 values to prevent memory leaks
    if (metric.values.length > 100) {
      metric.values.shift();
    }
  }

  // Get metrics for a label
  getMetrics(label) {
    const metric = this.metrics.get(label);
    if (!metric) return null;

    return {
      count: metric.count,
      average: metric.total / metric.count,
      min: metric.min === Infinity ? 0 : metric.min,
      max: metric.max === -Infinity ? 0 : metric.max,
      total: metric.total,
      lastValue: metric.values[metric.values.length - 1] || 0
    };
  }

  // Get all metrics
  getAllMetrics() {
    const result = {};
    for (const [label, metric] of this.metrics) {
      result[label] = {
        count: metric.count,
        average: metric.total / metric.count,
        min: metric.min === Infinity ? 0 : metric.min,
        max: metric.max === -Infinity ? 0 : metric.max,
        total: metric.total,
        lastValue: metric.values[metric.values.length - 1] || 0
      };
    }
    return result;
  }

  // Reset metrics
  reset() {
    this.metrics.clear();
    this.startTimes.clear();
  }

  // Log slow operations
  logSlowOperations(threshold = 1000) {
    const slowOps = [];
    for (const [label, metric] of this.metrics) {
      const avgTime = metric.total / metric.count;
      if (avgTime > threshold) {
        slowOps.push({
          label,
          averageTime: avgTime,
          count: metric.count
        });
      }
    }

    if (slowOps.length > 0) {
      console.warn('Slow operations detected:', slowOps);
    }

    return slowOps;
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Middleware to automatically monitor request duration
const monitorRequest = (req, res, next) => {
  const label = `${req.method} ${req.route?.path || req.path}`;
  performanceMonitor.start(label);

  res.on('finish', () => {
    const duration = performanceMonitor.end(label);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${label} took ${duration.toFixed(2)}ms`);
    }
  });

  next();
};

// Database query monitoring
const monitorDatabaseQuery = (queryName, queryFn) => {
  return async (...args) => {
    const label = `DB_${queryName}`;
    performanceMonitor.start(label);
    
    try {
      const result = await queryFn(...args);
      performanceMonitor.end(label);
      return result;
    } catch (error) {
      performanceMonitor.end(label);
      throw error;
    }
  };
};

// Memory usage monitoring
const getMemoryUsage = () => {
  const memUsage = process.memoryUsage();
  return {
    rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
  };
};

// CPU usage monitoring
const getCPUUsage = () => {
  const cpuUsage = process.cpuUsage();
  return {
    user: cpuUsage.user / 1000000, // Convert to seconds
    system: cpuUsage.system / 1000000, // Convert to seconds
  };
};

// Health check endpoint data
const getHealthData = () => {
  const memUsage = getMemoryUsage();
  const cpuUsage = getCPUUsage();
  const metrics = performanceMonitor.getAllMetrics();

  return {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: memUsage,
    cpu: cpuUsage,
    performance: metrics,
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  };
};

module.exports = {
  performanceMonitor,
  monitorRequest,
  monitorDatabaseQuery,
  getMemoryUsage,
  getCPUUsage,
  getHealthData,
};
