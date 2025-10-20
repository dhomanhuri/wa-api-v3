const express = require('express');
const metricsCollector = require('../utils/metrics');
const { apiLogger } = require('../utils/logger');

const router = express.Router();

// Get metrics
router.get('/', (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    apiLogger.error({ error: error.message }, 'Failed to get metrics');
    res.status(500).json({
      success: false,
      message: 'Failed to get metrics',
      error: error.message
    });
  }
});

// Reset metrics
router.post('/reset', (req, res) => {
  try {
    metricsCollector.resetMetrics();
    
    apiLogger.info('Metrics reset requested');
    
    res.json({
      success: true,
      message: 'Metrics reset successfully'
    });
  } catch (error) {
    apiLogger.error({ error: error.message }, 'Failed to reset metrics');
    res.status(500).json({
      success: false,
      message: 'Failed to reset metrics',
      error: error.message
    });
  }
});

module.exports = router;
