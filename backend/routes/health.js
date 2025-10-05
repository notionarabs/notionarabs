const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getHealthData } = require('../utils/performance');

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const healthData = getHealthData();
    
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    healthData.database = {
      status: dbStates[dbState] || 'unknown',
      readyState: dbState
    };
    
    // Determine overall health
    const isHealthy = (
      dbState === 1 && // Database connected
      healthData.memory.heapUsed < 1000 && // Less than 1GB heap usage
      healthData.uptime > 0
    );
    
    healthData.status = isHealthy ? 'healthy' : 'unhealthy';
    
    res.status(isHealthy ? 200 : 503).json(healthData);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Performance metrics endpoint
router.get('/metrics', (req, res) => {
  const healthData = getHealthData();
  res.json({
    timestamp: healthData.timestamp,
    performance: healthData.performance,
    memory: healthData.memory,
    cpu: healthData.cpu,
    uptime: healthData.uptime
  });
});

module.exports = router;
