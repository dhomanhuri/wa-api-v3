#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 WhatsApp API Server Launcher\n');

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
    console.log('❌ config.env.example file not found. Please create .env file manually.\n');
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

// Determine mode
const mode = process.argv[2] || 'start';
const isDev = mode === 'dev' || mode === 'development';

console.log(`🎯 Starting server in ${isDev ? 'development' : 'production'} mode...\n`);

// Start the server
const serverProcess = spawn('node', ['src/server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGTERM');
});
