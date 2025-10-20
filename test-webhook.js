const axios = require('axios');

class WebhookTester {
  constructor(baseURL = 'http://localhost:3000', apiKey = 'your-secret-api-key-here') {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: `${baseURL}/api`,
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  async testWebhookStatus() {
    try {
      console.log('🔍 Testing webhook status...');
      const response = await this.client.get('/webhook/status');
      console.log('✅ Webhook status:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Webhook status check failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async testWebhookTest() {
    try {
      console.log('🧪 Testing webhook test endpoint...');
      const response = await this.client.post('/webhook/test', {
        eventType: 'test',
        data: {
          message: 'Test webhook dari API',
          timestamp: new Date().toISOString(),
          testData: {
            number: 123,
            boolean: true,
            array: [1, 2, 3]
          }
        }
      });
      console.log('✅ Webhook test:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Webhook test failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async testCustomWebhook() {
    try {
      console.log('📤 Testing custom webhook...');
      const response = await this.client.post('/webhook/send', {
        eventType: 'custom.test',
        data: {
          customField: 'customValue',
          timestamp: new Date().toISOString(),
          metadata: {
            source: 'webhook-tester',
            version: '1.0.0'
          }
        }
      });
      console.log('✅ Custom webhook:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Custom webhook failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async testMessageWebhook() {
    try {
      console.log('📨 Testing message webhook...');
      const response = await this.client.post('/webhook/send', {
        eventType: 'message.received',
        data: {
          messageId: 'test_message_' + Date.now(),
          from: '6281234567890@s.whatsapp.net',
          timestamp: Date.now(),
          messageType: 'text',
          content: {
            text: 'Test message dari webhook tester'
          },
          sender: {
            jid: '6281234567890@s.whatsapp.net',
            pushName: 'Test User'
          }
        }
      });
      console.log('✅ Message webhook:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Message webhook failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Webhook Tests...\n');
    
    try {
      // Test webhook status
      await this.testWebhookStatus();
      console.log('');
      
      // Test webhook test endpoint
      await this.testWebhookTest();
      console.log('');
      
      // Test custom webhook
      await this.testCustomWebhook();
      console.log('');
      
      // Test message webhook
      await this.testMessageWebhook();
      console.log('');
      
      console.log('✅ All webhook tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Some webhook tests failed:', error.message);
    }
  }
}

// Example usage
if (require.main === module) {
  const tester = new WebhookTester();
  
  const args = process.argv.slice(2);
  
  if (args[0] === 'status') {
    tester.testWebhookStatus();
  } else if (args[0] === 'test') {
    tester.testWebhookTest();
  } else if (args[0] === 'custom') {
    tester.testCustomWebhook();
  } else if (args[0] === 'message') {
    tester.testMessageWebhook();
  } else {
    tester.runAllTests();
  }
}

module.exports = WebhookTester;
