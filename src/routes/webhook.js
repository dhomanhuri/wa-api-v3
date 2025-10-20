const express = require('express');
const WebhookService = require('../services/webhook');
const { apiLogger } = require('../utils/logger');

const router = express.Router();
const webhookService = new WebhookService();

// Middleware untuk validasi API key
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or missing API key'
    });
  }
  
  next();
};

// Apply API key validation to all routes
router.use(validateApiKey);

// Get webhook status
router.get('/status', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        enabled: webhookService.isEnabled(),
        webhookUrl: webhookService.getWebhookUrl(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    apiLogger.error('Failed to get webhook status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get webhook status',
      error: error.message
    });
  }
});

// Test webhook
router.post('/test', async (req, res) => {
  try {
    const { eventType = 'test', data = {} } = req.body;
    
    apiLogger.info(`Testing webhook with event: ${eventType}`);
    
    const result = await webhookService.sendWebhook(eventType, {
      ...data,
      test: true,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Webhook test completed',
      result: result
    });
  } catch (error) {
    apiLogger.error('Webhook test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook test failed',
      error: error.message
    });
  }
});

// Send custom webhook
router.post('/send', async (req, res) => {
  try {
    const { eventType, data } = req.body;
    
    if (!eventType) {
      return res.status(400).json({
        success: false,
        message: 'eventType is required'
      });
    }
    
    apiLogger.info(`Sending custom webhook: ${eventType}`);
    
    const result = await webhookService.sendWebhook(eventType, data);
    
    res.json({
      success: true,
      message: 'Custom webhook sent',
      result: result
    });
  } catch (error) {
    apiLogger.error('Failed to send custom webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send custom webhook',
      error: error.message
    });
  }
});

module.exports = router;
