#!/usr/bin/env node

const axios = require('axios');

class WhatsAppAPITester {
  constructor(baseURL = 'http://localhost:3000', apiKey = 'your-secret-api-key-here') {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: `${baseURL}/api`,
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 seconds timeout
    });
  }

  async testHealth() {
    try {
      console.log('🔍 Testing health endpoint...');
      const response = await this.client.get('/health');
      console.log('✅ Health check passed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async testWhatsAppStatus() {
    try {
      console.log('📱 Testing WhatsApp status...');
      const response = await this.client.get('/whatsapp/status');
      console.log('✅ WhatsApp status:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ WhatsApp status check failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async testGetQRCode() {
    try {
      console.log('📱 Testing QR code generation...');
      const response = await this.client.get('/whatsapp/qr');
      console.log('✅ QR code response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ QR code generation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async testSendMessage(to, message, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`📤 Testing send message to ${to} (attempt ${attempt}/${retries})...`);
        
        const response = await this.client.post('/whatsapp/send-message', {
          to,
          message: `${message} - Attempt ${attempt}`
        });
        
        console.log('✅ Message sent successfully:', response.data);
        return response.data;
        
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.response?.data || error.message);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Wait before retrying
        const delay = attempt * 2000; // 2s, 4s, 6s
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async testMetrics() {
    try {
      console.log('📊 Testing metrics endpoint...');
      const response = await this.client.get('/metrics');
      console.log('✅ Metrics retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Metrics retrieval failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async runDiagnostics() {
    console.log('🚀 Starting WhatsApp API Diagnostics...\n');
    
    try {
      // Test health
      await this.testHealth();
      console.log('');
      
      // Test WhatsApp status
      const status = await this.testWhatsAppStatus();
      console.log('');
      
      if (!status.data.isConnected) {
        console.log('⚠️  WhatsApp is not connected!');
        
        if (status.data.qrCode) {
          console.log('📱 QR Code is available. Please scan it with WhatsApp.');
          await this.testGetQRCode();
        } else {
          console.log('❌ No QR Code available. Please restart the service.');
        }
        console.log('');
      } else {
        console.log('✅ WhatsApp is connected!');
      }
      
      // Test metrics
      await this.testMetrics();
      console.log('');
      
      console.log('✅ Diagnostics completed!');
      
    } catch (error) {
      console.error('❌ Diagnostics failed:', error.message);
    }
  }

  async runMessageTests(testPhoneNumber) {
    console.log('📱 Starting Message Tests...\n');
    
    try {
      // Test single message with retries
      await this.testSendMessage(testPhoneNumber, 'Hello from API Test! 🚀');
      console.log('');
      
      console.log('✅ Message tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Message tests failed:', error.message);
    }
  }
}

// Example usage
if (require.main === module) {
  const tester = new WhatsAppAPITester();
  
  const args = process.argv.slice(2);
  
  if (args[0] === 'messages' && args[1]) {
    tester.runMessageTests(args[1]);
  } else if (args[0] === 'diagnostics') {
    tester.runDiagnostics();
  } else {
    console.log('🔧 WhatsApp API Tester');
    console.log('Usage:');
    console.log('  node test-api-fixed.js diagnostics              - Run full diagnostics');
    console.log('  node test-api-fixed.js messages 6281234567890     - Test message sending');
  }
}

module.exports = WhatsAppAPITester;
