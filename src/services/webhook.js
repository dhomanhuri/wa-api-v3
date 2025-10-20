const axios = require('axios');
const { apiLogger } = require('../utils/logger');

class WebhookService {
  constructor() {
    this.webhookUrl = process.env.WEBHOOK_URL;
    this.maxRetries = 3;
    this.timeout = 10000; // 10 seconds
    this.enabled = !!this.webhookUrl;
    
    if (this.enabled) {
      apiLogger.info(`Webhook service initialized with URL: ${this.webhookUrl}`);
    } else {
      apiLogger.warn('Webhook service disabled - no WEBHOOK_URL provided');
    }
  }

  async sendWebhook(eventType, data) {
    if (!this.enabled) {
      apiLogger.debug('Webhook disabled, skipping event:', eventType);
      return;
    }

    const payload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data: data
    };

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        apiLogger.info(`Sending webhook ${eventType} (attempt ${attempt}/${this.maxRetries})`);
        
        const response = await axios.post(this.webhookUrl, payload, {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'WhatsApp-API-Webhook/1.0.0'
          }
        });

        apiLogger.info(`Webhook sent successfully: ${eventType}`, {
          status: response.status,
          attempt: attempt
        });

        return {
          success: true,
          status: response.status,
          attempt: attempt
        };

      } catch (error) {
        apiLogger.error(`Webhook attempt ${attempt} failed:`, {
          event: eventType,
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        });

        // If it's the last attempt, throw the error
        if (attempt === this.maxRetries) {
          break;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        apiLogger.info(`Retrying webhook in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All retries failed
    apiLogger.error(`All webhook attempts failed for event: ${eventType}`);
    return {
      success: false,
      error: 'All retry attempts failed'
    };
  }

  async sendMessageReceivedWebhook(messageData) {
    const webhookData = {
      messageId: messageData.key.id,
      from: messageData.key.remoteJid,
      timestamp: messageData.messageTimestamp,
      messageType: this.getMessageType(messageData.message),
      content: this.extractMessageContent(messageData.message),
      sender: {
        jid: messageData.key.remoteJid,
        pushName: messageData.pushName || 'Unknown'
      }
    };

    return await this.sendWebhook('message.received', webhookData);
  }

  async sendMessageSentWebhook(messageId, to, messageType, content) {
    const webhookData = {
      messageId: messageId,
      to: to,
      messageType: messageType,
      content: content,
      timestamp: new Date().toISOString()
    };

    return await this.sendWebhook('message.sent', webhookData);
  }

  async sendConnectionStatusWebhook(isConnected, qrCode = null) {
    const webhookData = {
      isConnected: isConnected,
      qrCode: qrCode,
      timestamp: new Date().toISOString()
    };

    return await this.sendWebhook('connection.status', webhookData);
  }

  async sendErrorWebhook(errorType, errorMessage, context = {}) {
    const webhookData = {
      errorType: errorType,
      errorMessage: errorMessage,
      context: context,
      timestamp: new Date().toISOString()
    };

    return await this.sendWebhook('error.occurred', webhookData);
  }

  getMessageType(message) {
    if (message.textMessage) return 'text';
    if (message.imageMessage) return 'image';
    if (message.videoMessage) return 'video';
    if (message.audioMessage) return 'audio';
    if (message.documentMessage) return 'document';
    if (message.stickerMessage) return 'sticker';
    if (message.contactMessage) return 'contact';
    if (message.locationMessage) return 'location';
    if (message.groupInviteMessage) return 'group_invite';
    return 'unknown';
  }

  extractMessageContent(message) {
    if (message.textMessage) {
      return {
        text: message.textMessage.text
      };
    }
    
    if (message.imageMessage) {
      return {
        caption: message.imageMessage.caption || '',
        mimetype: message.imageMessage.mimetype || 'image/jpeg'
      };
    }
    
    if (message.videoMessage) {
      return {
        caption: message.videoMessage.caption || '',
        mimetype: message.videoMessage.mimetype || 'video/mp4'
      };
    }
    
    if (message.audioMessage) {
      return {
        mimetype: message.audioMessage.mimetype || 'audio/ogg'
      };
    }
    
    if (message.documentMessage) {
      return {
        fileName: message.documentMessage.fileName || 'document',
        mimetype: message.documentMessage.mimetype || 'application/octet-stream'
      };
    }
    
    if (message.stickerMessage) {
      return {
        mimetype: message.stickerMessage.mimetype || 'image/webp'
      };
    }
    
    if (message.contactMessage) {
      return {
        displayName: message.contactMessage.displayName || '',
        vcard: message.contactMessage.vcard || ''
      };
    }
    
    if (message.locationMessage) {
      return {
        latitude: message.locationMessage.degreesLatitude,
        longitude: message.locationMessage.degreesLongitude,
        name: message.locationMessage.name || '',
        address: message.locationMessage.address || ''
      };
    }
    
    return {
      raw: message
    };
  }

  isEnabled() {
    return this.enabled;
  }

  getWebhookUrl() {
    return this.webhookUrl;
  }
}

module.exports = WebhookService;
