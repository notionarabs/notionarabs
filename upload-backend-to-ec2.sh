#!/bin/bash

# ===========================================
# UPLOAD BACKEND TO EC2 SCRIPT
# ===========================================
# This script uploads your backend code to EC2

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
EC2_USER="ubuntu"
EC2_HOST="50.19.23.245"  # Your EC2 public IP
EC2_PATH="/var/www/notion-arabs-backend"
LOCAL_BACKEND_PATH="./backend"

# Check if backend directory exists
if [ ! -d "$LOCAL_BACKEND_PATH" ]; then
    print_error "Backend directory not found at $LOCAL_BACKEND_PATH"
    exit 1
fi

print_status "Uploading backend code to EC2..."

# Create a temporary directory for upload
TEMP_DIR=$(mktemp -d)
cp -r $LOCAL_BACKEND_PATH/* $TEMP_DIR/

# Copy environment file
if [ -f "backend-production.env" ]; then
    cp backend-production.env $TEMP_DIR/.env
    print_success "Environment file copied"
else
    print_warning "backend-production.env not found. You'll need to create .env manually on EC2."
fi

# Upload to EC2
print_status "Uploading files to EC2..."
rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no" $TEMP_DIR/ $EC2_USER@$EC2_HOST:$EC2_PATH/

# Clean up
rm -rf $TEMP_DIR

print_success "Backend code uploaded successfully!"

# SSH commands to run on EC2
print_status "Running setup commands on EC2..."

ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST << 'EOF'
cd /var/www/notion-arabs-backend

echo "Installing dependencies..."
npm install --production

echo "Setting up PM2 ecosystem..."
# Create PM2 ecosystem file if it doesn't exist
if [ ! -f "ecosystem.config.js" ]; then
cat > ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [{
    name: 'notion-arabs-backend',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
PM2EOF
fi

echo "Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "Backend setup completed!"
echo "Application is running on port 5000"
EOF

print_success "Backend deployment completed!"
print_status "Your backend should now be running on http://$EC2_HOST:5000"
print_warning "Next steps:"
echo "1. Configure Nginx reverse proxy"
echo "2. Set up SSL certificate"
echo "3. Update your Vercel frontend with the correct API URL"
