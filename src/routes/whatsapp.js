const express = require('express');
const multer = require('multer');
const WhatsAppService = require('../services/whatsapp');
const InputValidator = require('../utils/validator');
const { apiLogger } = require('../utils/logger');
const rateLimits = require('../middleware/rateLimit');
const metricsCollector = require('../utils/metrics');

const router = express.Router();
const whatsappService = new WhatsAppService();

// Initialize WhatsApp service
whatsappService.initialize().catch(console.error);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Middleware untuk validasi API key
const validateApiKey = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    InputValidator.validateApiKey(apiKey);
    next();
  } catch (error) {
    apiLogger.warn({ error: error.message, ip: req.ip }, 'Invalid API key attempt');
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

// Apply API key validation to all routes
router.use(validateApiKey);

// Get connection status
router.get('/status', async (req, res) => {
  try {
    const status = await whatsappService.getConnectionStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get connection status',
      error: error.message
    });
  }
});

// Apply rate limiting to specific routes
router.use(rateLimits.general);

// Get QR Code with rate limiting
router.get('/qr', rateLimits.qrCode, async (req, res) => {
  try {
    metricsCollector.incrementCounter('qrCodeRequests');
    const qrResult = await whatsappService.getQRCode();
    res.json(qrResult);
  } catch (error) {
    metricsCollector.incrementCounter('apiErrors');
    res.status(500).json({
      success: false,
      message: 'Failed to get QR code',
      error: error.message
    });
  }
});

// Send text message with rate limiting
router.post('/send-message', rateLimits.sendMessage, async (req, res) => {
  try {
    const { to, message, options = {} } = req.body;
    
    // Validate input
    const validatedTo = InputValidator.validatePhoneNumber(to);
    const validatedMessage = InputValidator.validateMessage(message);
    
    apiLogger.info({ to: validatedTo, messageLength: validatedMessage.length }, 'Sending text message');
    
    const result = await whatsappService.sendMessage(validatedTo, { text: validatedMessage }, options);
    
    apiLogger.info({ messageId: result.messageId, to: validatedTo }, 'Message sent successfully');
    metricsCollector.incrementCounter('messagesSent');
    res.json(result);
  } catch (error) {
    apiLogger.error({ error: error.message, to: req.body.to }, 'Failed to send message');
    metricsCollector.incrementCounter('messagesFailed');
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Send media message with rate limiting
router.post('/send-media', rateLimits.sendMessage, upload.single('media'), async (req, res) => {
  try {
    const { to, caption = '', mediaType, fileName } = req.body;
    const mediaBuffer = req.file?.buffer;
    
    // Validate input
    const validatedTo = InputValidator.validatePhoneNumber(to);
    const validatedMediaType = InputValidator.validateMediaType(mediaType);
    const validatedCaption = InputValidator.validateMessage(caption);
    
    if (!mediaBuffer) {
      throw new Error('Media file is required');
    }
    
    InputValidator.validateFileSize(mediaBuffer.length);
    
    apiLogger.info({ 
      to: validatedTo, 
      mediaType: validatedMediaType, 
      fileSize: mediaBuffer.length,
      captionLength: validatedCaption.length 
    }, 'Sending media message');
    
    const result = await whatsappService.sendMediaMessage(
      validatedTo, 
      mediaBuffer, 
      validatedMediaType, 
      validatedCaption,
      { fileName }
    );
    
    apiLogger.info({ messageId: result.messageId, to: validatedTo }, 'Media message sent successfully');
    metricsCollector.incrementCounter('mediaSent');
    res.json(result);
  } catch (error) {
    apiLogger.error({ error: error.message, to: req.body.to }, 'Failed to send media message');
    metricsCollector.incrementCounter('mediaFailed');
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Send bulk messages with rate limiting
router.post('/send-bulk', rateLimits.bulkMessage, async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Validate bulk messages
    const validatedMessages = InputValidator.validateBulkMessages(messages);
    
    apiLogger.info({ messageCount: validatedMessages.length }, 'Sending bulk messages');
    
    const results = [];
    
    for (const msg of validatedMessages) {
      try {
        const result = await whatsappService.sendMessage(msg.to, { text: msg.message }, msg.options);
        
        results.push({
          to: msg.to,
          success: true,
          messageId: result.messageId
        });
        
        apiLogger.info({ messageId: result.messageId, to: msg.to }, 'Bulk message sent');
        
        // Add delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        apiLogger.error({ error: error.message, to: msg.to }, 'Failed to send bulk message');
        results.push({
          to: msg.to,
          success: false,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    apiLogger.info({ 
      total: validatedMessages.length, 
      success: successCount, 
      failed: failureCount 
    }, 'Bulk messages completed');
    
    metricsCollector.incrementCounter('bulkRequests');
    metricsCollector.incrementCounter('bulkMessagesSent', successCount);
    metricsCollector.incrementCounter('bulkMessagesFailed', failureCount);
    
    res.json({
      success: true,
      message: 'Bulk messages processed',
      summary: {
        total: validatedMessages.length,
        success: successCount,
        failed: failureCount
      },
      results: results
    });
  } catch (error) {
    apiLogger.error({ error: error.message }, 'Failed to process bulk messages');
    metricsCollector.incrementCounter('apiErrors');
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const result = await whatsappService.logout();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
      error: error.message
    });
  }
});

module.exports = router;
