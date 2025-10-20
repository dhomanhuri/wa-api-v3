#!/bin/bash

# WhatsApp API Server Startup Script

echo "🚀 Starting WhatsApp API Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp config.env.example .env
    echo "📝 Please edit .env file with your configuration"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create sessions directory if it doesn't exist
if [ ! -d "sessions" ]; then
    echo "📁 Creating sessions directory..."
    mkdir -p sessions
fi

# Start the server
echo "🎯 Starting server..."
if [ "$1" = "dev" ]; then
    echo "🔧 Development mode with nodemon"
    npm run dev
else
    echo "🏭 Production mode"
    npm start
fi
