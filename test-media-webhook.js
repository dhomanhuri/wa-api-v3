const axios = require('axios');

class MediaWebhookTester {
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

  async testMediaWebhook() {
    try {
      console.log('📸 Testing media webhook...');
      const response = await this.client.post('/webhook/send', {
        eventType: 'message.received',
        data: {
          messageId: 'test_image_' + Date.now(),
          from: '6281234567890@s.whatsapp.net',
          timestamp: Date.now(),
          messageType: 'image',
          content: {
            caption: 'Test image dari webhook',
            mimetype: 'image/jpeg',
            mediaDownloaded: true,
            filename: 'test_image_' + Date.now() + '.jpg',
            fileSize: 245760,
            downloadUrl: '/media/test_image_' + Date.now() + '.jpg',
            base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
          },
          sender: {
            jid: '6281234567890@s.whatsapp.net',
            pushName: 'Test User'
          }
        }
      });
      console.log('✅ Media webhook test:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Media webhook test failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async testVideoWebhook() {
    try {
      console.log('🎥 Testing video webhook...');
      const response = await this.client.post('/webhook/send', {
        eventType: 'message.received',
        data: {
          messageId: 'test_video_' + Date.now(),
          from: '6281234567890@s.whatsapp.net',
          timestamp: Date.now(),
          messageType: 'video',
          content: {
            caption: 'Test video dari webhook',
            mimetype: 'video/mp4',
            mediaDownloaded: true,
            filename: 'test_video_' + Date.now() + '.mp4',
            fileSize: 1024000,
            downloadUrl: '/media/test_video_' + Date.now() + '.mp4'
          },
          sender: {
            jid: '6281234567890@s.whatsapp.net',
            pushName: 'Test User'
          }
        }
      });
      console.log('✅ Video webhook test:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Video webhook test failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Media Webhook Tests...\n');
    
    try {
      await this.testMediaWebhook();
      console.log('');
      
      await this.testVideoWebhook();
      console.log('');
      
      console.log('✅ All media webhook tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Some media webhook tests failed:', error.message);
    }
  }
}

if (require.main === module) {
  const tester = new MediaWebhookTester();
  tester.runAllTests();
}

module.exports = MediaWebhookTester;
