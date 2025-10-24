#!/bin/bash

# GitHub to EC2 Deployment Script
# This script pushes your local changes to GitHub and provides deployment instructions

set -e

echo "🚀 GitHub to EC2 Deployment Setup"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_warning "Not in a git repository. Initializing..."
    git init
    git remote add origin https://github.com/hazemyasserprg/notion-arabs.git
fi

# Check current status
print_info "Checking git status..."
git status

echo ""
print_info "Current repository: https://github.com/hazemyasserprg/notion-arabs.git"
echo ""

# Add all changes
print_status "Adding all changes..."
git add .

# Commit changes
print_status "Committing changes..."
git commit -m "Fix API endpoint - Add /api route handler

- Added route handler for /api endpoint
- Returns available API endpoints
- Fixes 404 error for /api requests
- Includes timestamp and version info"

# Push to GitHub
print_status "Pushing to GitHub..."
git push origin main

echo ""
print_status "✅ Changes pushed to GitHub successfully!"
echo ""

print_info "📋 Next Steps for EC2 Deployment:"
echo "1. Connect to your EC2 instance via AWS Console"
echo "2. Run these commands on EC2:"
echo ""
echo "   cd ~"
echo "   git clone https://github.com/hazemyasserprg/notion-arabs.git"
echo "   cd notion-arabs/backend"
echo "   npm install"
echo "   pm2 start ecosystem.config.js --env production"
echo ""
echo "3. For future updates, run:"
echo "   cd ~/notion-arabs"
echo "   git pull origin main"
echo "   cd backend"
echo "   npm ci --production"
echo "   pm2 restart notion-arabs-backend"
echo ""

print_info "🔗 Your GitHub repository: https://github.com/hazemyasserprg/notion-arabs.git"
print_info "🖥️  Your EC2 instance: ec2-50-19-23-245.compute-1.amazonaws.com"
