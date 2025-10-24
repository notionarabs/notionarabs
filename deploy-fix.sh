#!/bin/bash

# Quick fix deployment script for Notion Arabs Backend
set -e

echo "🚀 Deploying API fix to EC2 instance..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if backend directory exists
if [ ! -d "backend" ]; then
    print_error "Backend directory not found!"
    exit 1
fi

# Create a temporary archive with the fix
print_status "Creating deployment package..."
cd backend
tar -czf ../backend-fix.tar.gz index.js package.json package-lock.json

print_status "✅ Fix package created: backend-fix.tar.gz"
print_status "📋 Next steps:"
print_status "1. Upload backend-fix.tar.gz to your EC2 instance"
print_status "2. Extract it in your backend directory"
print_status "3. Restart the PM2 process: pm2 restart notion-arabs-backend"
print_status "4. Test the API: curl http://ec2-50-19-23-245.compute-1.amazonaws.com/api"

cd ..
