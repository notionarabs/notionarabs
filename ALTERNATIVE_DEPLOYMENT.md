# Alternative Deployment Methods for EC2 API Fix

## Method 1: Manual File Upload via AWS Console

### Step 1: Access AWS Console
1. Go to https://console.aws.amazon.com/ec2/
2. Find your instance: ec2-50-19-23-245.compute-1.amazonaws.com
3. Click "Connect" → "Session Manager"

### Step 2: Upload the fix file
1. In Session Manager, click "Upload file"
2. Select `backend-fix.zip` from your local machine
3. Upload it to `/home/ubuntu/`

### Step 3: Deploy the fix
```bash
cd ~/notion-arabs-backend
unzip ~/backend-fix.zip
pm2 restart notion-arabs-backend
```

---

## Method 2: Direct File Edit via AWS Console

### Step 1: Access AWS Console
1. Go to https://console.aws.amazon.com/ec2/
2. Find your instance: ec2-50-19-23-245.compute-1.amazonaws.com
3. Click "Connect" → "Session Manager"

### Step 2: Edit the file directly
```bash
cd ~/notion-arabs-backend
nano index.js
```

### Step 3: Add the API route handler
Find line 173 (after the root route) and add this code:
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

### Step 4: Save and restart
```bash
# In nano: Ctrl+X, then Y, then Enter
pm2 restart notion-arabs-backend
```

---

## Method 3: Fix SSH Key Permissions (Windows)

### Step 1: Open PowerShell as Administrator
Right-click PowerShell → "Run as Administrator"

### Step 2: Fix key permissions
```powershell
# Remove inheritance
icacls "C:\Users\hazem\.ssh\ec2-key.pem" /inheritance:r

# Grant full access to current user
icacls "C:\Users\hazem\.ssh\ec2-key.pem" /grant:r "hazem:F"

# Remove access for other users
icacls "C:\Users\hazem\.ssh\ec2-key.pem" /remove "Users"
icacls "C:\Users\hazem\.ssh\ec2-key.pem" /remove "Authenticated Users"
```

### Step 3: Try SSH again
```bash
ssh -i "C:\Users\hazem\.ssh\ec2-key.pem" ubuntu@ec2-50-19-23-245.compute-1.amazonaws.com
```

---

## Method 4: Use PuTTY (Alternative SSH Client)

### Step 1: Download PuTTY
1. Download PuTTY from https://www.putty.org/
2. Install and open PuTTY

### Step 2: Convert your key
1. Open PuTTYgen
2. Load your private key: `C:\Users\hazem\.ssh\ec2-key.pem`
3. Save as `.ppk` format

### Step 3: Connect with PuTTY
1. Open PuTTY
2. Host: `ec2-50-19-23-245.compute-1.amazonaws.com`
3. Port: 22
4. Load your converted key
5. Connect

---

## Quick Test After Deployment

Once you've deployed the fix using any method above:

```bash
curl http://ec2-50-19-23-245.compute-1.amazonaws.com/api
```

You should see a JSON response with available endpoints instead of the 404 error.

---

## Recommended Approach

**I recommend Method 1 (AWS Console + Session Manager)** as it's the most reliable and doesn't require SSH key troubleshooting.
