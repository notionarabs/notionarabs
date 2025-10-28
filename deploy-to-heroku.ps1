# Heroku Deployment Script for Notion Arabs Backend
# Run this script from the root directory of your project

Write-Host "`n=== Heroku Deployment for Notion Arabs Backend ===" -ForegroundColor Cyan

# Step 1: Navigate to backend directory
Write-Host "`nStep 1: Navigating to backend directory..." -ForegroundColor Yellow
Set-Location backend

# Step 2: Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository in backend directory..." -ForegroundColor Yellow
    git init
}

# Step 3: Check if Heroku remote exists
Write-Host "`nStep 2: Checking for Heroku remote..." -ForegroundColor Yellow
$herokuRemote = git remote -v | Select-String "heroku"

if (-not $herokuRemote) {
    Write-Host "Adding Heroku remote..." -ForegroundColor Yellow
    heroku git:remote -a notion-arabs
} else {
    Write-Host "Heroku remote already exists." -ForegroundColor Green
}

# Step 4: Show current status
Write-Host "`nStep 3: Checking git status..." -ForegroundColor Yellow
git status

# Step 5: Instructions for next steps
Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Make sure you're logged in: heroku login" -ForegroundColor Yellow
Write-Host "2. Configure environment variables (see DEPLOYMENT.md)" -ForegroundColor Yellow
Write-Host "3. Commit your changes: git add . && git commit -m 'Deploy backend to Heroku'" -ForegroundColor Yellow
Write-Host "4. Deploy: git push heroku main" -ForegroundColor Yellow
Write-Host "`nNote: If your default branch is 'master', use: git push heroku master:main" -ForegroundColor Yellow

Write-Host "`n=== Configuration Needed ===" -ForegroundColor Red
Write-Host "Don't forget to set these environment variables in Heroku:" -ForegroundColor Red
Write-Host "- MONGODB_URI" -ForegroundColor Red
Write-Host "- FRONTEND_URL" -ForegroundColor Red
Write-Host "- JWT_SECRET" -ForegroundColor Red
Write-Host "- Node.js buildpack and working directory configuration" -ForegroundColor Red

Write-Host "`nFor detailed instructions, see DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host "`n=== End ===" -ForegroundColor Cyan

