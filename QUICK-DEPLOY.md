# Quick Deploy to Heroku - notion-arabs

## ✅ What's Already Done

1. ✅ Heroku app created: `notion-arabs`
2. ✅ MONGODB_URI configured
3. ✅ PROJECT_PATH=backend configured
4. ✅ FRONTEND_URL configured
5. ✅ Procfile created in backend/

## 🔧 What You Need to Do

### 1. Set JWT_SECRET (IMPORTANT!)

```powershell
heroku config:set JWT_SECRET="your_actual_jwt_secret_key_here" -a notion-arabs
```

**Warning:** Use a strong random string. Generate one with:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Set Other Optional Environment Variables

If you use Google OAuth, email, Cloudinary, or Redis, set them:

```powershell
# Google OAuth (if using)
heroku config:set GOOGLE_CLIENT_ID="your_client_id" -a notion-arabs
heroku config:set GOOGLE_CLIENT_SECRET="your_client_secret" -a notion-arabs

# Email (if using)
heroku config:set EMAIL_USER="your_email@domain.com" -a notion-arabs
heroku config:set EMAIL_PASS="your_email_password" -a notion-arabs
heroku config:set EMAIL_FROM="support@notionarabs.com" -a notion-arabs

# Cloudinary (if using)
heroku config:set CLOUDINARY_CLOUD_NAME="your_cloud_name" -a notion-arabs
heroku config:set CLOUDINARY_API_KEY="your_api_key" -a notion-arabs
heroku config:set CLOUDINARY_API_SECRET="your_api_secret" -a notion-arabs

# Redis (if using - optional)
heroku config:set REDIS_URL="your_redis_url" -a notion-arabs
```

### 3. Configure Buildpacks (ONE TIME SETUP)

Run these commands to tell Heroku how to build your app:

```powershell
heroku buildpacks:clear -a notion-arabs
heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack -a notion-arabs
heroku buildpacks:add heroku/nodejs -a notion-arabs
```

### 4. Deploy to Heroku

```powershell
# Make sure you're in the root directory
cd C:\Users\hazem\OneDrive\Desktop\notion-arabs

# Add and commit your changes
git add .
git commit -m "Prepare for Heroku deployment"

# Deploy
git push heroku main
```

If your default branch is `master`:
```powershell
git push heroku master:main
```

### 5. Check Deployment Status

```powershell
# View logs
heroku logs --tail -a notion-arabs

# Check if app is running
heroku ps -a notion-arabs

# Open the app
heroku open -a notion-arabs
```

## 🎯 Your Backend Will Be At

After deployment, your backend API will be available at:
```
https://notion-arabs.herokuapp.com
```

Update your frontend to use this URL in production.

## 🔍 Troubleshooting

### If deployment fails:
```powershell
# Check build logs
heroku builds -a notion-arabs
heroku builds:info BUILD_ID -a notion-arabs

# Check runtime logs
heroku logs --tail -a notion-arabs

# Restart the app
heroku restart -a notion-arabs
```

### If your app crashes:
```powershell
# Check what went wrong
heroku logs --tail -a notion-arabs

# Make sure env vars are set
heroku config -a notion-arabs
```

## 📋 Quick Command Reference

```powershell
# View all config vars
heroku config -a notion-arabs

# Set a config var
heroku config:set KEY=value -a notion-arabs

# Remove a config var
heroku config:unset KEY -a notion-arabs

# View logs
heroku logs --tail -a notion-arabs

# Restart app
heroku restart -a notion-arabs

# Run a command in the Heroku environment
heroku run bash -a notion-arabs

# Check dyno status
heroku ps -a notion-arabs

# Scale dynos (if needed - requires paid tier)
heroku ps:scale web=1 -a notion-arabs
```

