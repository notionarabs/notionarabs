# Step-by-Step Deployment Guide for EC2 API Fix

## Method 1: Using SCP (Secure Copy) - Recommended

### Step 1: Upload the fix to your EC2 instance
```bash
scp backend-fix.zip ec2-user@ec2-50-19-23-245.compute-1.amazonaws.com:~/
```

### Step 2: SSH into your EC2 instance
```bash
ssh ec2-user@ec2-50-19-23-245.compute-1.amazonaws.com
```

### Step 3: Navigate to your backend directory and extract the fix
```bash
cd /path/to/your/backend/directory
unzip ~/backend-fix.zip
```

### Step 4: Restart the PM2 process
```bash
pm2 restart notion-arabs-backend
```

### Step 5: Test the fix
```bash
curl http://localhost:5000/api
```

---

## Method 2: Using AWS Console (if you prefer GUI)

### Step 1: Upload via AWS Console
1. Go to AWS EC2 Console
2. Find your instance: ec2-50-19-23-245.compute-1.amazonaws.com
3. Right-click → Connect → Session Manager
4. Upload backend-fix.zip using the file upload feature

### Step 2: Extract and deploy
```bash
cd /path/to/your/backend/directory
unzip ~/backend-fix.zip
pm2 restart notion-arabs-backend
```

---

## Method 3: Direct file editing (if you have access)

### Step 1: SSH into your EC2 instance
```bash
ssh ec2-user@ec2-50-19-23-245.compute-1.amazonaws.com
```

### Step 2: Navigate to backend directory
```bash
cd /path/to/your/backend/directory
```

### Step 3: Edit index.js directly
```bash
nano index.js
```

### Step 4: Add this code after line 173 (after the root route):
```javascript
// API base route
app.get('/api', (req, res) => {
  res.json({
    message: 'Notion Arabs API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      templates: '/api/templates',
      blogs: '/api/blogs',
      creators: '/api/creators',
      health: '/api/health',
      stats: '/api/stats',
      contact: '/api/contact',
      ratings: '/api/ratings',
      comments: '/api/comments',
      notifications: '/api/notifications',
      orders: '/api/orders',
      upload: '/api/upload',
      screenshot: '/api/screenshot',
      unsubscribe: '/api/unsubscribe'
    },
    timestamp: new Date().toISOString()
  });
});
```

### Step 5: Save and restart
```bash
# Save the file (Ctrl+X, then Y, then Enter in nano)
pm2 restart notion-arabs-backend
```

---

## Verification

After any of the above methods, test the fix:

```bash
curl http://ec2-50-19-23-245.compute-1.amazonaws.com/api
```

You should see a JSON response with the API endpoints list instead of the 404 error.

---

## Troubleshooting

If you get permission errors:
```bash
sudo chown -R ec2-user:ec2-user /path/to/your/backend/directory
```

If PM2 doesn't restart:
```bash
pm2 list
pm2 stop notion-arabs-backend
pm2 start ecosystem.config.js --env production
```
