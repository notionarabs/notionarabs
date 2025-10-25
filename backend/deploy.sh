#!/bin/bash

# Notion Arabs Backend Deployment Script
# This script handles the deployment of the backend API

echo "🚀 Starting Notion Arabs Backend Deployment..."
echo "📅 Date: $(date)"
echo "👤 User: $(whoami)"
echo "📂 Current directory: $(pwd)"

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
fi

echo "📦 Installing/updating dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Make sure environment variables are set."
fi

# Stop existing PM2 processes
echo "🛑 Stopping existing PM2 processes..."
pm2 stop notion-arabs-backend 2>/dev/null || echo "No existing process found"
pm2 delete notion-arabs-backend 2>/dev/null || echo "No existing process to delete"

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start index.js --name "notion-arabs-backend" --env production

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script
echo "⚙️  Setting up PM2 startup script..."
pm2 startup

echo "✅ Backend deployment completed successfully!"
echo "🔍 Checking PM2 status..."
pm2 status

echo "📊 Application logs (last 20 lines):"
pm2 logs notion-arabs-backend --lines 20

echo ""
echo "🎉 Notion Arabs Backend is now running!"
echo "🌐 API should be available on port 5000"
echo "📝 Use 'pm2 logs notion-arabs-backend' to view logs"
echo "🔄 Use 'pm2 restart notion-arabs-backend' to restart"
