#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 WhatsApp API Server & Test Suite\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found. Creating from example...');
  const examplePath = path.join(__dirname, 'env.example');
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('📝 Please edit .env file with your configuration before running again.\n');
    process.exit(1);
  } else {
    console.log('❌ env.example file not found. Please create .env file manually.\n');
    process.exit(1);
  }
}

// Create necessary directories
const sessionsDir = path.join(__dirname, 'sessions');
const logsDir = path.join(__dirname, 'logs');

if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
  console.log('📁 Created sessions directory');
}

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('📁 Created logs directory');
}

console.log('🎯 Starting server...\n');

// Start the server
const serverProcess = spawn('node', ['src/server.js'], {
  stdio: 'pipe',
  cwd: __dirname
});

let serverReady = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  if (output.includes('WhatsApp API Server running')) {
    serverReady = true;
    console.log('\n✅ Server is ready! Running tests...\n');
    
    // Wait a bit for server to fully initialize
    setTimeout(() => {
      runTests();
    }, 2000);
  }
});

serverProcess.stderr.on('data', (data) => {
  console.error('Server Error:', data.toString());
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

function runTests() {
  console.log('🧪 Running API tests...\n');
  
  const testProcess = spawn('node', ['test-api.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  testProcess.on('exit', (code) => {
    console.log(`\n📊 Tests completed with code: ${code}`);
    
    if (code === 0) {
      console.log('✅ All tests passed!');
    } else {
      console.log('❌ Some tests failed');
    }
    
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGINT');
    
    setTimeout(() => {
      process.exit(code);
    }, 1000);
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});
