const { 
  default: makeWASocket, 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { whatsappLogger } = require('../utils/logger');
const WebhookService = require('./webhook');

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.isConnected = false;
    this.qrCode = null;
    this.sessionPath = process.env.WHATSAPP_SESSION_PATH || './sessions';
    this.logger = whatsappLogger;
    this.webhookService = new WebhookService();
    this.reconnectCount = 0;
    this.maxReconnectDelay = 30000; // Max 30 seconds
  }

  async initialize() {
    try {
      // Ensure session directory exists
      if (!fs.existsSync(this.sessionPath)) {
        fs.mkdirSync(this.sessionPath, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath);
      
      let version;
      try {
        const latest = await fetchLatestBaileysVersion();
        version = latest.version;
      } catch (err) {
        this.logger.warn('Failed to fetch latest Baileys version, using default:', err.message);
        version = [2, 3000, 1015901307]; // Fallback version
      }
      
      this.sock = makeWASocket({
        version,
        logger: this.logger,
        printQRInTerminal: false,
        auth: state,
        browser: ['WhatsApp API', 'Chrome', '1.0.0'],
        generateHighQualityLinkPreview: true,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        retryRequestDelayMs: 250,
        maxMsgRetryCount: 5,
        getMessage: async (key) => {
          return {
            conversation: 'Hello!'
          };
        }
      });

      this.setupEventHandlers(saveCreds);
      
      return {
        success: true,
        message: 'WhatsApp service initialized successfully'
      };
    } catch (error) {
      this.logger.error('Failed to initialize WhatsApp service:', error);
      
      // If initialization fails, it might be due to corrupt session files
      // Try clearing the session and initializing again once
      if (!this._retryCount || this._retryCount < 1) {
        this._retryCount = (this._retryCount || 0) + 1;
        this.logger.info('Attempting to clear session and re-initialize...');
        this.clearSession();
        return this.initialize();
      }
      
      throw error;
    }
  }

  setupEventHandlers(saveCreds) {
    this.sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        this.qrCode = qr;
        console.log('📱 Scan QR Code below:');
        qrcode.generate(qr, { small: true });
      }
      
      if (connection === 'close') {
        const error = lastDisconnect?.error;
        const statusCode = error?.output?.statusCode || error?.data?.statusCode || error?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        this.logger.info({ statusCode, error: error?.message }, `Connection closed. Reconnecting: ${shouldReconnect}`);
        
        if (shouldReconnect) {
          this.reconnectCount++;
          const delay = Math.min(Math.pow(2, this.reconnectCount) * 1000, this.maxReconnectDelay);
          
          console.log(`🔄 Reconnecting in ${delay/1000}s... (Attempt ${this.reconnectCount})`);
          setTimeout(() => {
            this.initialize();
          }, delay);
        } else {
          console.log('❌ Connection closed. Session invalidated or logged out. Please scan QR code again.');
          this.isConnected = false;
          this.qrCode = null;
          this.reconnectCount = 0;
          
          // Clear session on logout/invalid session
          this.clearSession();
          
          // Send webhook for disconnection
          this.webhookService.sendConnectionStatusWebhook(false).catch(err => {
            this.logger.error('Failed to send disconnection webhook:', err.message);
          });
        }
      } else if (connection === 'open') {
        console.log('✅ WhatsApp connected successfully!');
        this.isConnected = true;
        this.qrCode = null;
        this.reconnectCount = 0;
        this._retryCount = 0; // Reset initialize retry count
        
        // Send webhook for connection status
        this.webhookService.sendConnectionStatusWebhook(true).catch(err => {
          this.logger.error('Failed to send connection webhook:', err.message);
        });
      }
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('messages.upsert', async (m) => {
      console.log('📨 New message received:', JSON.stringify(m, undefined, 2));
      
      // Process incoming messages and send webhook
      for (const message of m.messages) {
        try {
          // Only process messages that are not from us
          if (!message.key.fromMe) {
            await this.webhookService.sendMessageReceivedWebhook(message, this.sock);
          }
        } catch (error) {
          this.logger.error('Failed to process incoming message webhook:', error.message);
        }
      }
    });
  }

  async sendMessage(jid, message, options = {}) {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!this.isConnected) {
          throw new Error('WhatsApp is not connected');
        }

        this.logger.info(`Attempt ${attempt}/${maxRetries} to send message to ${jid}`);

        // Add timeout wrapper
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Message send timeout after 30 seconds')), 30000);
        });

        const sendPromise = this.sock.sendMessage(jid, message, options);
        
        const result = await Promise.race([sendPromise, timeoutPromise]);
        
        this.logger.info(`Message sent successfully on attempt ${attempt}`);
        
        // Send webhook for sent message
        try {
          const messageType = this.getMessageType(message);
          const content = this.extractMessageContent(message);
          await this.webhookService.sendMessageSentWebhook(
            result.key.id, 
            jid, 
            messageType, 
            content
          );
        } catch (webhookError) {
          this.logger.error('Failed to send message sent webhook:', webhookError.message);
        }
        
        return {
          success: true,
          messageId: result.key.id,
          message: 'Message sent successfully'
        };
      } catch (error) {
        lastError = error;
        this.logger.error(`Attempt ${attempt} failed:`, error.message);
        
        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        this.logger.info(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // All retries failed
    this.logger.error('All retry attempts failed:', lastError);
    
    // Send webhook for error
    try {
      await this.webhookService.sendErrorWebhook(
        'message.send.failed',
        lastError.message,
        { jid, attempts: maxRetries }
      );
    } catch (webhookError) {
      this.logger.error('Failed to send error webhook:', webhookError.message);
    }
    
    if (lastError.message.includes('timeout')) {
      throw new Error('Message send timeout after multiple attempts. Please check your connection.');
    }
    
    throw lastError;
  }

  getMessageType(message) {
    if (message.text) return 'text';
    if (message.image) return 'image';
    if (message.video) return 'video';
    if (message.audio) return 'audio';
    if (message.document) return 'document';
    if (message.sticker) return 'sticker';
    if (message.contact) return 'contact';
    if (message.location) return 'location';
    return 'unknown';
  }

  extractMessageContent(message) {
    if (message.text) {
      return { text: message.text };
    }
    
    if (message.image) {
      return {
        caption: message.caption || '',
        mimetype: message.mimetype || 'image/jpeg'
      };
    }
    
    if (message.video) {
      return {
        caption: message.caption || '',
        mimetype: message.mimetype || 'video/mp4'
      };
    }
    
    if (message.audio) {
      return {
        mimetype: message.mimetype || 'audio/ogg'
      };
    }
    
    if (message.document) {
      return {
        fileName: message.fileName || 'document',
        mimetype: message.mimetype || 'application/octet-stream'
      };
    }
    
    return { raw: message };
  }

  getMimeTypeForMediaType(mediaType) {
    const mimeTypes = {
      'image': 'image/jpeg',
      'video': 'video/mp4',
      'audio': 'audio/mp4',
      'document': 'application/pdf'
    };
    return mimeTypes[mediaType] || 'application/octet-stream';
  }

  getFileExtension(mediaType) {
    const extensions = {
      'image': 'jpg',
      'video': 'mp4',
      'audio': 'mp3',
      'document': 'pdf'
    };
    return extensions[mediaType] || 'bin';
  }

  async sendMediaMessage(jid, mediaBuffer, mediaType, caption = '', options = {}) {
    try {
      if (!this.isConnected) {
        throw new Error('WhatsApp is not connected');
      }

      let message;
      
      switch (mediaType) {
        case 'image':
          message = {
            image: mediaBuffer,
            caption: caption
          };
          break;
        case 'video':
          message = {
            video: mediaBuffer,
            caption: caption
          };
          break;
        case 'audio':
          message = {
            audio: mediaBuffer,
            mimetype: 'audio/mp4'
          };
          break;
        case 'document':
          message = {
            document: mediaBuffer,
            mimetype: 'application/pdf',
            fileName: options.fileName || 'document.pdf'
          };
          break;
        default:
          throw new Error('Unsupported media type');
      }

      // Add timeout wrapper for media messages
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Media message send timeout after 60 seconds')), 60000);
      });

      const sendPromise = this.sock.sendMessage(jid, message, options);
      
      const result = await Promise.race([sendPromise, timeoutPromise]);
      
      // Send webhook for sent media message
      try {
        const messageType = mediaType;
        const content = {
          caption: caption,
          mimetype: this.getMimeTypeForMediaType(mediaType),
          fileName: options.fileName || `media.${this.getFileExtension(mediaType)}`
        };
        await this.webhookService.sendMessageSentWebhook(
          result.key.id, 
          jid, 
          messageType, 
          content
        );
      } catch (webhookError) {
        this.logger.error('Failed to send media message sent webhook:', webhookError.message);
      }
      
      return {
        success: true,
        messageId: result.key.id,
        message: 'Media message sent successfully'
      };
    } catch (error) {
      this.logger.error('Failed to send media message:', error);
      
      // Check if it's a timeout error
      if (error.message.includes('timeout')) {
        throw new Error('Media message send timeout. Please try again.');
      }
      
      throw error;
    }
  }

  async getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      qrCode: this.qrCode,
      sessionPath: this.sessionPath
    };
  }

  async getQRCode() {
    if (this.qrCode) {
      return {
        success: true,
        qrCode: this.qrCode
      };
    } else if (this.isConnected) {
      return {
        success: false,
        message: 'WhatsApp is already connected'
      };
    } else {
      return {
        success: false,
        message: 'QR Code not available. Please restart the service.'
      };
    }
  }

  clearSession() {
    try {
      if (fs.existsSync(this.sessionPath)) {
        const sessionFiles = fs.readdirSync(this.sessionPath);
        sessionFiles.forEach(file => {
          try {
            const filePath = path.join(this.sessionPath, file);
            if (fs.lstatSync(filePath).isFile()) {
              fs.unlinkSync(filePath);
            } else if (fs.lstatSync(filePath).isDirectory()) {
              fs.rmSync(filePath, { recursive: true, force: true });
            }
          } catch (err) {
            this.logger.error(`Failed to delete session file ${file}:`, err.message);
          }
        });
        this.logger.info('Session directory cleared');
      }
    } catch (error) {
      this.logger.error('Failed to clear session directory:', error.message);
    }
  }

  async logout() {
    try {
      if (this.sock) {
        try {
          await this.sock.logout();
        } catch (err) {
          this.logger.error('Error during sock.logout():', err.message);
        }
        this.isConnected = false;
        
        this.clearSession();
        
        return {
          success: true,
          message: 'Logged out successfully'
        };
      }
      
      return {
        success: false,
        message: 'No active session found'
      };
    } catch (error) {
      this.logger.error('Failed to logout:', error);
      throw error;
    }
  }
}

module.exports = WhatsAppService;
