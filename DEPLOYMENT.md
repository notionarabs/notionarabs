# Heroku Deployment Guide for Notion Arabs Backend

## Prerequisites

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login to Heroku: `heroku login`

## Current Setup

Your backend is in the `backend/` subdirectory. The deployment is configured to work from the root directory.

## Deployment Steps

### 1. Login to Heroku (if not already logged in)
```powershell
heroku login
```

### 2. Check Heroku Remote
The Heroku remote should be added to your git repository. Check with:
```powershell
git remote -v
```

You should see both `origin` (GitHub) and `heroku` remotes.

### 3. Configure Heroku Environment Variables

Set up your environment variables in Heroku dashboard or via CLI:

```powershell
# MongoDB URI
heroku config:set MONGODB_URI="your_mongodb_connection_string" -a notion-arabs

# Frontend URL (your production frontend domain)
heroku config:set FRONTEND_URL="https://notionarabs.com" -a notion-arabs

# JWT Secret
heroku config:set JWT_SECRET="your_secret_key" -a notion-arabs

# Google OAuth (if using)
heroku config:set GOOGLE_CLIENT_ID="your_client_id" -a notion-arabs
heroku config:set GOOGLE_CLIENT_SECRET="your_client_secret" -a notion-arabs

# Email Configuration (if using)
heroku config:set EMAIL_USER="your_email" -a notion-arabs
heroku config:set EMAIL_PASS="your_email_password" -a notion-arabs

# Cloudinary (if using)
heroku config:set CLOUDINARY_CLOUD_NAME="your_cloud_name" -a notion-arabs
heroku config:set CLOUDINARY_API_KEY="your_api_key" -a notion-arabs
heroku config:set CLOUDINARY_API_SECRET="your_api_secret" -a notion-arabs

# Redis (if using)
heroku config:set REDIS_URL="your_redis_connection_string" -a notion-arabs

# Other environment variables as needed
heroku config:set NODE_ENV="production" -a notion-arabs
```

### 4. Configure Heroku to Use Backend Subdirectory

Since your backend is in a subdirectory, tell Heroku about it:

```powershell
# Set the project directory
heroku config:set PROJECT_PATH=backend -a notion-arabs

# Or install the monorepo buildpack if needed
heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack -a notion-arabs
heroku buildpacks:add heroku/nodejs -a notion-arabs
```

### 5. Commit Your Changes

```powershell
git add .
git commit -m "Prepare for Heroku deployment"
```

### 6. Deploy to Heroku

```powershell
git push heroku main
```

If your default branch is `master` instead of `main`:
```powershell
git push heroku master:main
```

### 7. Check Logs

After deployment, check the logs to ensure everything is running:

```powershell
heroku logs --tail -a notion-arabs
```

### 8. Open Your App

```powershell
heroku open -a notion-arabs
```

## Important Notes

1. **MongoDB**: Make sure your MongoDB connection string is accessible from Heroku
2. **Database**: Set up your production database on MongoDB Atlas or similar
3. **Redis**: If using Redis, set up Heroku Redis addon or use external Redis service
4. **File Uploads**: The `uploads/` folder won't persist on Heroku. Consider using Cloudinary or S3 for file storage
5. **Puppeteer**: Make sure Puppeteer builds correctly on Heroku (may need additional buildpacks)

## Troubleshooting

### Check Build Logs
```powershell
heroku builds:info -a notion-arabs
```

### Restart the Dyno
```powershell
heroku restart -a notion-arabs
```

### Run Commands in Heroku
```powershell
heroku run bash -a notion-arabs
```

### Check Environment Variables
```powershell
heroku config -a notion-arabs
```

## Updating the Deployment

After making changes:

```powershell
git add .
git commit -m "Update backend"
git push heroku main
```

## Alternative: Deploy from Backend Directory

If the above doesn't work, you can deploy directly from the backend directory:

1. Navigate to backend folder
2. Initialize git there (or work from there)
3. Add Heroku remote
4. Deploy from there

```powershell
cd backend
git init
heroku git:remote -a notion-arabs
git add .
git commit -m "Deploy backend"
git push heroku main
```

