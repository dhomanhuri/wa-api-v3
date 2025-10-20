const validator = require('validator');

class InputValidator {
  static validatePhoneNumber(phone) {
    if (!phone) {
      throw new Error('Phone number is required');
    }
    
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid phone number format
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      throw new Error('Invalid phone number format');
    }
    
    // Format as WhatsApp JID
    return cleanPhone.includes('@') ? cleanPhone : `${cleanPhone}@s.whatsapp.net`;
  }
  
  static validateMessage(message) {
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required and must be a string');
    }
    
    if (message.length > 4096) {
      throw new Error('Message is too long (max 4096 characters)');
    }
    
    return message.trim();
  }
  
  static validateMediaType(mediaType) {
    const allowedTypes = ['image', 'video', 'audio', 'document'];
    
    if (!mediaType || !allowedTypes.includes(mediaType)) {
      throw new Error(`Invalid media type. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    return mediaType;
  }
  
  static validateFileSize(fileSize, maxSize = 10 * 1024 * 1024) {
    if (fileSize > maxSize) {
      throw new Error(`File size too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
    }
    
    return true;
  }
  
  static validateApiKey(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    if (apiKey !== process.env.API_KEY) {
      throw new Error('Invalid API key');
    }
    
    return true;
  }
  
  static validateBulkMessages(messages) {
    if (!Array.isArray(messages)) {
      throw new Error('Messages must be an array');
    }
    
    if (messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }
    
    if (messages.length > 100) {
      throw new Error('Too many messages. Maximum 100 messages per bulk request');
    }
    
    return messages.map((msg, index) => {
      if (!msg.to || !msg.message) {
        throw new Error(`Message at index ${index} is missing required fields: to, message`);
      }
      
      return {
        to: this.validatePhoneNumber(msg.to),
        message: this.validateMessage(msg.message),
        options: msg.options || {}
      };
    });
  }
}

module.exports = InputValidator;
