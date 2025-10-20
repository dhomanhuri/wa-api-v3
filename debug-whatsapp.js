const WhatsAppService = require('./services/whatsapp');

class WhatsAppDebugger {
  constructor() {
    this.whatsappService = new WhatsAppService();
  }

  async initialize() {
    try {
      await this.whatsappService.initialize();
      console.log('✅ WhatsApp service initialized');
      
      // Monitor connection status every 5 seconds
      this.startConnectionMonitoring();
      
    } catch (error) {
      console.error('❌ Failed to initialize WhatsApp service:', error);
    }
  }

  startConnectionMonitoring() {
    setInterval(async () => {
      try {
        const status = await this.whatsappService.getConnectionStatus();
        console.log(`📊 Status: ${status.isConnected ? 'Connected' : 'Disconnected'}`);
        
        if (!status.isConnected && !status.qrCode) {
          console.log('⚠️  WhatsApp not connected and no QR code available');
        }
      } catch (error) {
        console.error('❌ Error checking status:', error.message);
      }
    }, 5000);
  }

  async testConnection() {
    try {
      const status = await this.whatsappService.getConnectionStatus();
      
      if (status.isConnected) {
        console.log('✅ WhatsApp is connected');
        
        // Test sending a message to yourself
        const testJid = 'status@broadcast'; // Broadcast message
        const testMessage = { text: 'Connection test - ' + new Date().toISOString() };
        
        console.log('🧪 Testing message send...');
        const result = await this.whatsappService.sendMessage(testJid, testMessage);
        console.log('✅ Test message sent:', result);
        
      } else if (status.qrCode) {
        console.log('📱 QR Code available for scanning');
        console.log('QR Code:', status.qrCode);
      } else {
        console.log('❌ WhatsApp not connected and no QR code available');
        console.log('💡 Try restarting the service');
      }
      
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
    }
  }

  async getDetailedStatus() {
    try {
      const status = await this.whatsappService.getConnectionStatus();
      
      console.log('\n📊 WhatsApp Connection Status:');
      console.log('================================');
      console.log(`Connected: ${status.isConnected ? '✅ Yes' : '❌ No'}`);
      console.log(`QR Code Available: ${status.qrCode ? '✅ Yes' : '❌ No'}`);
      console.log(`Session Path: ${status.sessionPath}`);
      
      if (status.qrCode) {
        console.log('\n📱 QR Code:');
        console.log(status.qrCode);
      }
      
      return status;
    } catch (error) {
      console.error('❌ Failed to get status:', error.message);
      return null;
    }
  }
}

// CLI interface
if (require.main === module) {
  const whatsappDebugger = new WhatsAppDebugger();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'init':
      whatsappDebugger.initialize();
      break;
      
    case 'status':
      whatsappDebugger.initialize().then(() => {
        setTimeout(() => {
          whatsappDebugger.getDetailedStatus();
        }, 2000);
      });
      break;
      
    case 'test':
      whatsappDebugger.initialize().then(() => {
        setTimeout(() => {
          whatsappDebugger.testConnection();
        }, 2000);
      });
      break;
      
    default:
      console.log('🔧 WhatsApp Debugger');
      console.log('Usage:');
      console.log('  node debug-whatsapp.js init    - Initialize and monitor');
      console.log('  node debug-whatsapp.js status  - Get detailed status');
      console.log('  node debug-whatsapp.js test   - Test connection');
      break;
  }
}

module.exports = WhatsAppDebugger;
