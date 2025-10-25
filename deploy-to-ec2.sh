#!/bin/bash

# ===========================================
# NOTION ARABS - EC2 DEPLOYMENT SCRIPT
# ===========================================
# This script will set up your EC2 instance for the Notion Arabs backend

set -e  # Exit on any error

echo "🚀 Starting Notion Arabs Backend Deployment to EC2..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root. Use a regular user with sudo privileges."
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
print_success "Node.js installed: $node_version"
print_success "npm installed: $npm_version"

# Install MongoDB
print_status "Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable MongoDB
print_status "Starting MongoDB service..."
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
print_status "Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/notion-arabs-backend
sudo chown $USER:$USER /var/www/notion-arabs-backend

# Install UFW firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 5000
sudo ufw --force enable

print_success "EC2 environment setup completed!"
print_status "Next steps:"
echo "1. Upload your backend code to /var/www/notion-arabs-backend"
echo "2. Copy the .env file to the backend directory"
echo "3. Install dependencies: npm install"
echo "4. Start the application with PM2"
echo "5. Configure Nginx reverse proxy"
echo "6. Set up SSL certificate"

print_warning "Don't forget to:"
echo "- Update your EC2 security group to allow HTTP (80) and HTTPS (443)"
echo "- Configure your domain to point to this EC2 instance"
echo "- Update environment variables with your actual values"
