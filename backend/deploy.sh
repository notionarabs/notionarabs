#!/bin/bash

# Quick deployment script for Notion Arabs Backend
set -e

echo "🚀 Starting deployment process..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found! Please create it from .env.example"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci --production

# Install Puppeteer Chrome browser
print_status "Installing Puppeteer Chrome browser..."
npx puppeteer browsers install chrome

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs

# Create uploads directory
print_status "Creating uploads directory..."
mkdir -p uploads/screenshots

# Set proper permissions
print_status "Setting file permissions..."
chmod 755 index.js

# Start/restart PM2 process
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup

print_status "✅ Deployment completed successfully!"
print_status "Backend is running on port 5000"
print_status "Check status with: pm2 status"
print_status "View logs with: pm2 logs notion-arabs-backend"
