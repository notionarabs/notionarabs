# Quick Heroku Setup Script
# Run from PowerShell in the project root

Write-Host "Setting up Heroku for notion-arabs backend..." -ForegroundColor Cyan

# Step 1: Make sure you're logged in (manual step)
Write-Host "`n[MANUAL STEP REQUIRED]" -ForegroundColor Yellow
Write-Host "Please run: heroku login" -ForegroundColor Yellow
Write-Host "Press Enter after logging in..." -ForegroundColor Yellow
Read-Host

# Step 2: Add Heroku remote to root (optional - for tracking)
Write-Host "`nAdding Heroku remote to root repository..." -ForegroundColor Yellow
heroku git:remote -a notion-arabs

# Step 3: Configure Heroku for the backend subdirectory
Write-Host "`nConfiguring Heroku for backend subdirectory..." -ForegroundColor Yellow
heroku buildpacks:clear -a notion-arabs
heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack -a notion-arabs
heroku buildpacks:add heroku/nodejs -a notion-arabs

# Step 4: Set the subdirectory path
Write-Host "Setting PROJECT_PATH to backend..." -ForegroundColor Yellow
heroku config:set PROJECT_PATH=backend -a notion-arabs

# Step 5: Show environment variables that need to be set
Write-Host "`n=== CRITICAL: Set these environment variables ===" -ForegroundColor Red
Write-Host "heroku config:set MONGODB_URI='your_mongodb_uri' -a notion-arabs" -ForegroundColor Yellow
Write-Host "heroku config:set FRONTEND_URL='your_frontend_url' -a notion-arabs" -ForegroundColor Yellow
Write-Host "heroku config:set JWT_SECRET='your_secret' -a notion-arabs" -ForegroundColor Yellow
Write-Host "heroku config:set NODE_ENV=production -a notion-arabs" -ForegroundColor Yellow

Write-Host "`n=== Ready to Deploy ===" -ForegroundColor Green
Write-Host "After setting environment variables:" -ForegroundColor Green
Write-Host "git add ." -ForegroundColor White
Write-Host "git commit -m 'Deploy to Heroku'" -ForegroundColor White
Write-Host "git push heroku main" -ForegroundColor White

