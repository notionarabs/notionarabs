# GitHub to EC2 Deployment Setup Guide

## Overview
This guide will help you connect your EC2 instance to your GitHub repository for automatic deployments.

## Prerequisites
- GitHub repository: `https://github.com/hazemyasserprg/notion-arabs.git`
- EC2 instance: `ec2-50-19-23-245.compute-1.amazonaws.com`
- SSH access to EC2 (we'll fix the key issue)

## Method 1: Manual Git Clone Setup (Recommended)

### Step 1: Connect to EC2 via AWS Console
1. Go to https://console.aws.amazon.com/ec2/
2. Find your instance: `ec2-50-19-23-245.compute-1.amazonaws.com`
3. Click "Connect" → "Session Manager"

### Step 2: Install Git on EC2 (if not already installed)
```bash
sudo apt update
sudo apt install git -y
```

### Step 3: Clone your repository
```bash
cd ~
git clone https://github.com/hazemyasserprg/notion-arabs.git
cd notion-arabs
```

### Step 4: Set up the backend
```bash
cd backend
npm install
```

### Step 5: Create deployment script
```bash
nano deploy-from-github.sh
```

Add this content:
```bash
#!/bin/bash
set -e

echo "🚀 Deploying from GitHub..."

# Navigate to project directory
cd ~/notion-arabs

# Pull latest changes
git pull origin main

# Install/update dependencies
cd backend
npm ci --production

# Install Puppeteer Chrome browser
npx puppeteer browsers install chrome

# Create necessary directories
mkdir -p logs
mkdir -p uploads/screenshots

# Set proper permissions
chmod 755 index.js

# Restart PM2 process
pm2 restart notion-arabs-backend

echo "✅ Deployment completed!"
```

### Step 6: Make script executable
```bash
chmod +x deploy-from-github.sh
```

### Step 7: Test deployment
```bash
./deploy-from-github.sh
```

---

## Method 2: GitHub Actions + EC2 (Advanced)

### Step 1: Create GitHub Actions workflow
Create `.github/workflows/deploy.yml` in your repository:

```yaml
name: Deploy to EC2

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to EC2
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ubuntu
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          cd ~/notion-arabs
          git pull origin main
          cd backend
          npm ci --production
          npx puppeteer browsers install chrome
          pm2 restart notion-arabs-backend
```

### Step 2: Add GitHub Secrets
In your GitHub repository:
1. Go to Settings → Secrets and variables → Actions
2. Add these secrets:
   - `EC2_HOST`: `ec2-50-19-23-245.compute-1.amazonaws.com`
   - `EC2_SSH_KEY`: Your private SSH key content

---

## Method 3: Webhook-based Deployment

### Step 1: Create webhook endpoint
Add this to your backend `index.js`:

```javascript
// Webhook endpoint for GitHub
app.post('/webhook/github', (req, res) => {
  const { exec } = require('child_process');
  
  // Verify webhook signature (optional but recommended)
  const signature = req.headers['x-hub-signature-256'];
  
  exec('cd ~/notion-arabs && git pull origin main && cd backend && npm ci --production && pm2 restart notion-arabs-backend', (error, stdout, stderr) => {
    if (error) {
      console.error(`Deployment error: ${error}`);
      return res.status(500).json({ success: false, error: error.message });
    }
    
    console.log('Deployment successful:', stdout);
    res.json({ success: true, message: 'Deployment completed' });
  });
});
```

### Step 2: Configure GitHub Webhook
1. Go to your GitHub repository
2. Settings → Webhooks → Add webhook
3. Payload URL: `http://ec2-50-19-23-245.compute-1.amazonaws.com/webhook/github`
4. Content type: `application/json`
5. Events: Just the push event

---

## Method 4: Simple Git Pull Script

### Step 1: Create a simple update script
```bash
nano update-backend.sh
```

Add this content:
```bash
#!/bin/bash
echo "🔄 Updating backend from GitHub..."

# Navigate to project
cd ~/notion-arabs

# Pull latest changes
git pull origin main

# Update backend dependencies
cd backend
npm ci --production

# Restart the application
pm2 restart notion-arabs-backend

echo "✅ Backend updated successfully!"
```

### Step 2: Make it executable
```bash
chmod +x update-backend.sh
```

### Step 3: Run updates manually
```bash
./update-backend.sh
```

---

## Recommended Approach

**I recommend Method 1 (Manual Git Clone Setup)** because:
- ✅ Simple and reliable
- ✅ No complex authentication setup
- ✅ Easy to troubleshoot
- ✅ Works with your current setup

## Next Steps

1. **Choose your preferred method**
2. **Follow the setup steps**
3. **Test the deployment**
4. **Set up automatic updates** (optional)

Which method would you like to implement?
