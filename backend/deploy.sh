#!/bin/bash

# Notion Arabs Backend Deployment Script - Optimized Version
# This script handles the deployment of the backend API with performance optimizations

set -e  # Exit on any error

echo "🚀 Starting Notion Arabs Backend Deployment..."
echo "📅 Date: $(date)"
echo "👤 User: $(whoami)"
echo "📂 Current directory: $(pwd)"

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Quick dependency checks
command -v node >/dev/null 2>&1 || { echo "❌ Error: Node.js is not installed"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ Error: npm is not installed"; exit 1; }

# Check if PM2 is installed (skip if already installed)
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2 --silent
fi

# Optimized npm install with cache and parallel processing
echo "📦 Installing/updating dependencies (optimized)..."
npm ci --prefer-offline --no-audit --no-fund --silent || npm install --prefer-offline --no-audit --no-fund --silent

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Make sure environment variables are set."
fi

# Stop existing PM2 processes (with timeout)
echo "🛑 Stopping existing PM2 processes..."
timeout 10s pm2 stop notion-arabs-backend 2>/dev/null || echo "No existing process found"
timeout 5s pm2 delete notion-arabs-backend 2>/dev/null || echo "No existing process to delete"

# Start the application with PM2 (with timeout)
echo "🚀 Starting application with PM2..."
timeout 30s pm2 start index.js --name "notion-arabs-backend" --env production

# Save PM2 configuration (with timeout)
echo "💾 Saving PM2 configuration..."
timeout 10s pm2 save

# Skip PM2 startup setup (can be done manually)
echo "⚙️  Skipping PM2 startup setup (run manually if needed)"

echo "✅ Backend deployment completed successfully!"
echo "🔍 Checking PM2 status..."
pm2 status

echo "📊 Application logs (last 10 lines):"
timeout 10s pm2 logs notion-arabs-backend --lines 10 || echo "Logs not available yet"

echo ""
echo "🎉 Notion Arabs Backend is now running!"
echo "🌐 API should be available on port 5000"
