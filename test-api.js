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
      }
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

  async testSendMessage(to, message) {
    try {
      console.log(`📤 Testing send message to ${to}...`);
      const response = await this.client.post('/whatsapp/send-message', {
        to,
        message
      });
      console.log('✅ Message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Send message failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async testSendBulkMessages(messages) {
    try {
      console.log(`📤 Testing bulk messages (${messages.length} messages)...`);
      const response = await this.client.post('/whatsapp/send-bulk', {
        messages
      });
      console.log('✅ Bulk messages sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Bulk messages failed:', error.response?.data || error.message);
      throw error;
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

  async runAllTests() {
    console.log('🚀 Starting WhatsApp API Tests...\n');
    
    try {
      // Test health
      await this.testHealth();
      console.log('');
      
      // Test WhatsApp status
      await this.testWhatsAppStatus();
      console.log('');
      
      // Test QR code
      await this.testGetQRCode();
      console.log('');
      
      // Test metrics
      await this.testMetrics();
      console.log('');
      
      console.log('✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Some tests failed:', error.message);
    }
  }

  async runMessageTests(testPhoneNumber) {
    console.log('📱 Starting Message Tests...\n');
    
    try {
      // Test single message
      await this.testSendMessage(testPhoneNumber, 'Hello from API Test! 🚀');
      console.log('');
      
      // Test bulk messages
      const bulkMessages = [
        { to: testPhoneNumber, message: 'Bulk message 1' },
        { to: testPhoneNumber, message: 'Bulk message 2' },
        { to: testPhoneNumber, message: 'Bulk message 3' }
      ];
      
      await this.testSendBulkMessages(bulkMessages);
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
  
  // Run basic tests
  tester.runAllTests().then(() => {
    console.log('\n📝 To test message sending, run:');
    console.log('node test-api.js messages 6281234567890');
  });
  
  // Check if message testing is requested
  const args = process.argv.slice(2);
  if (args[0] === 'messages' && args[1]) {
    tester.runMessageTests(args[1]);
  }
}

module.exports = WhatsAppAPITester;
