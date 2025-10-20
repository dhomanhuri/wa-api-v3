const P = require('pino');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure logger
const logger = P({
  level: process.env.WHATSAPP_LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
}, P.destination({
  dest: path.join(logsDir, 'app.log'),
  sync: false
}));

// Create child loggers for different modules
const whatsappLogger = logger.child({ module: 'whatsapp' });
const apiLogger = logger.child({ module: 'api' });
const errorLogger = logger.child({ module: 'error' });

module.exports = {
  logger,
  whatsappLogger,
  apiLogger,
  errorLogger
};
