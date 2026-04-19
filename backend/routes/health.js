const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
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
    
    // Check database connection (simple health query to Supabase)
    const { data, error } = await supabase.from('User').select('id').limit(1).maybeSingle();
    const isDbConnected = !error;
    
    healthData.database = {
      status: isDbConnected ? 'connected' : 'disconnected',
      error: error ? error.message : null
    };
    
    // Determine overall health
    const isHealthy = (
      isDbConnected && 
      healthData.memory.heapUsed < 1024 && // Less than 1GB heap usage
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
