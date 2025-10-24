# Complete AWS EC2 Deployment Guide for Notion Arabs Backend

## Prerequisites
- AWS EC2 instance running Ubuntu 20.04+
- Your EC2 instance IP: `ec2-50-19-23-245.compute-1.amazonaws.com`
- SSH key file: `C:\Users\hazem\.ssh\ec2-key.pem`

## Step 1: Connect to Your EC2 Instance

Open PowerShell and run:
```bash
ssh -i "C:\Users\hazem\.ssh\ec2-key.pem" ubuntu@ec2-50-19-23-245.compute-1.amazonaws.com
```

## Step 2: Set Up Server Environment

Once connected to EC2, run these commands:

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install PM2
```bash
sudo npm install -g pm2
```

### Install MongoDB
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install Additional Dependencies
```bash
sudo apt install -y git curl wget build-essential
```

## Step 3: Upload Your Backend Code

### Option A: Using SCP (from your local machine)
```bash
scp -i "C:\Users\hazem\.ssh\ec2-key.pem" -r backend/ ubuntu@ec2-50-19-23-245.compute-1.amazonaws.com:/home/ubuntu/notion-arabs-backend/
```

### Option B: Using Git (from EC2)
```bash
# On EC2 instance
cd /home/ubuntu
git clone https://github.com/your-username/notion-arabs.git
cd notion-arabs
```

## Step 4: Configure Environment Variables

```bash
cd /home/ubuntu/notion-arabs-backend
cp .env.example .env
nano .env
```

Configure these variables:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/notion-arabs

# Server
PORT=5000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## Step 5: Install Dependencies and Deploy

```bash
cd /home/ubuntu/notion-arabs-backend

# Install dependencies
npm ci --production

# Install Puppeteer Chrome
npx puppeteer browsers install chrome

# Create necessary directories
mkdir -p logs uploads/screenshots

# Start with PM2
pm2 start index.js --name "notion-arabs-backend"

# Save PM2 configuration
pm2 save

# Set up PM2 startup
pm2 startup
```

## Step 6: Configure Nginx

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/notion-arabs-backend
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /home/ubuntu/notion-arabs-backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/notion-arabs-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## Step 7: Set Up SSL (Optional)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Step 8: Configure Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## Step 9: Test Deployment

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs notion-arabs-backend

# Test health endpoint
curl http://localhost:5000/health

# Test through Nginx
curl http://your-domain.com/health
```

## Useful Commands

```bash
# PM2 Commands
pm2 restart notion-arabs-backend
pm2 stop notion-arabs-backend
pm2 logs notion-arabs-backend
pm2 monit

# Nginx Commands
sudo systemctl reload nginx
sudo systemctl status nginx

# MongoDB Commands
sudo systemctl status mongod
sudo systemctl restart mongod
```

## Troubleshooting

1. **Check PM2 logs:**
   ```bash
   pm2 logs notion-arabs-backend --err
   ```

2. **Check Nginx logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Check MongoDB:**
   ```bash
   sudo systemctl status mongod
   ```

4. **Restart services:**
   ```bash
   pm2 restart notion-arabs-backend
   sudo systemctl restart nginx
   sudo systemctl restart mongod
   ```
