#!/bin/bash

# Script to update Google OAuth environment variables on EC2
# Run this on your EC2 instance

echo "🔧 Setting up Google OAuth environment variables..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Creating one..."
    touch .env
fi

# Backup existing .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backed up existing .env file"

# Add Google OAuth variables (you need to replace these with your actual values)
echo "" >> .env
echo "# Google OAuth Configuration" >> .env
echo "GOOGLE_CLIENT_ID=your_google_client_id_here" >> .env
echo "GOOGLE_CLIENT_SECRET=your_google_client_secret_here" >> .env
echo "GOOGLE_CALLBACK_URL=http://ec2-50-19-23-245.compute-1.amazonaws.com/api/auth/google/callback" >> .env

echo "✅ Added Google OAuth environment variables to .env"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file and replace 'your_google_client_id_here' with your actual Google Client ID"
echo "2. Replace 'your_google_client_secret_here' with your actual Google Client Secret"
echo "3. Restart your backend: pm2 restart notion-arabs-backend"
echo ""
echo "🔍 To edit .env file: nano .env"
echo "🔄 To restart backend: pm2 restart notion-arabs-backend"
