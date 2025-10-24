# Google OAuth Setup Guide for EC2 Backend

## Problem
Your EC2 backend is missing Google OAuth environment variables, causing login to fail with:
```json
{"success":false,"message":"Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."}
```

## Solution: Complete Google OAuth Setup

### Step 1: Get Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create/Select Project**
   - Create a new project or select existing one
   - Name it "Notion Arabs" or similar

3. **Enable APIs**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" or "Google Identity API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Notion Arabs Web Client"

5. **Configure Authorized Redirect URIs**
   Add these URLs:
   ```
   http://ec2-50-19-23-245.compute-1.amazonaws.com/api/auth/google/callback
   https://notionarabs.com/api/auth/google/callback
   ```

6. **Get Your Credentials**
   - Copy the **Client ID** and **Client Secret**
   - Save them securely

### Step 2: Update EC2 Environment Variables

**Option A: Manual Setup (Recommended)**

1. **SSH into your EC2 instance:**
   ```bash
   ssh -i "C:\Users\hazem\.ssh\ec2-key.pem" ubuntu@ec2-50-19-23-245.compute-1.amazonaws.com
   ```

2. **Navigate to backend directory:**
   ```bash
   cd ~/notion-arabs/backend
   ```

3. **Edit .env file:**
   ```bash
   nano .env
   ```

4. **Add these lines to .env:**
   ```bash
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_actual_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
   GOOGLE_CALLBACK_URL=http://ec2-50-19-23-245.compute-1.amazonaws.com/api/auth/google/callback
   ```

5. **Save and exit:**
   - Press `Ctrl + X`
   - Press `Y` to confirm
   - Press `Enter` to save

6. **Restart backend:**
   ```bash
   pm2 restart notion-arabs-backend
   ```

**Option B: Using GitHub Actions (Automatic)**

1. **Add secrets to GitHub:**
   - Go to: https://github.com/hazemyasserprg/notion-arabs/settings/secrets/actions
   - Add these secrets:
     - `GOOGLE_CLIENT_ID`: Your Google Client ID
     - `GOOGLE_CLIENT_SECRET`: Your Google Client Secret

2. **Update GitHub Actions workflow** to include these environment variables

### Step 3: Test Google Login

1. **Visit your website:** https://notionarabs.com
2. **Click "Login with Google"**
3. **Should redirect to Google OAuth**
4. **After authorization, should redirect back and log you in**

### Step 4: Verify Setup

**Check if environment variables are loaded:**
```bash
# On EC2
pm2 logs notion-arabs-backend
```

**Look for this message:**
- ✅ `Google OAuth credentials found. Google login enabled.`
- ❌ `Google OAuth credentials not found. Google login will be disabled.`

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**
   - Make sure the redirect URI in Google Console matches exactly
   - Check for HTTP vs HTTPS mismatch

2. **"Client ID not found"**
   - Verify GOOGLE_CLIENT_ID is correct
   - Check for extra spaces or quotes

3. **"Client Secret invalid"**
   - Verify GOOGLE_CLIENT_SECRET is correct
   - Make sure it's the right secret (not the client ID)

4. **Backend not restarting**
   - Check PM2 status: `pm2 status`
   - Restart manually: `pm2 restart notion-arabs-backend`

### Security Notes:

- Never commit Google OAuth credentials to Git
- Use environment variables for all sensitive data
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console

## Expected Result

After setup, Google login should work perfectly:
1. User clicks "Login with Google"
2. Redirects to Google OAuth
3. User authorizes the app
4. Redirects back to your site
5. User is logged in automatically

Your backend will be fully functional with Google OAuth! 🚀
