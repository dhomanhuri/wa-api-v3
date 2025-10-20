const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs: windowMs,
    max: max,
    message: {
      success: false,
      message: message
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const rateLimits = {
  // General API rate limit
  general: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per window
    'Too many requests from this IP, please try again later'
  ),
  
  // Send message rate limit (more restrictive)
  sendMessage: createRateLimit(
    60 * 1000, // 1 minute
    10, // 10 messages per minute
    'Too many messages sent, please wait before sending more'
  ),
  
  // Bulk message rate limit (very restrictive)
  bulkMessage: createRateLimit(
    5 * 60 * 1000, // 5 minutes
    1, // 1 bulk request per 5 minutes
    'Bulk message limit exceeded, please wait before sending another bulk request'
  ),
  
  // QR code rate limit
  qrCode: createRateLimit(
    30 * 1000, // 30 seconds
    5, // 5 requests per 30 seconds
    'Too many QR code requests, please wait'
  )
};

module.exports = rateLimits;
