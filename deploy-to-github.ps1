# PowerShell script to push changes to GitHub and prepare EC2 deployment

Write-Host "🚀 GitHub to EC2 Deployment Setup" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "⚠️  Not in a git repository. Initializing..." -ForegroundColor Yellow
    git init
    git remote add origin https://github.com/hazemyasserprg/notion-arabs.git
}

# Check current status
Write-Host "📋 Checking git status..." -ForegroundColor Blue
git status

Write-Host ""
Write-Host "📋 Current repository: https://github.com/hazemyasserprg/notion-arabs.git" -ForegroundColor Blue
Write-Host ""

# Add all changes
Write-Host "➕ Adding all changes..." -ForegroundColor Green
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Green
git commit -m "Fix API endpoint - Add /api route handler

- Added route handler for /api endpoint
- Returns available API endpoints  
- Fixes 404 error for /api requests
- Includes timestamp and version info"

# Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Green
git push origin main

Write-Host ""
Write-Host "✅ Changes pushed to GitHub successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Next Steps for EC2 Deployment:" -ForegroundColor Blue
Write-Host "1. Connect to your EC2 instance via AWS Console" -ForegroundColor White
Write-Host "2. Run these commands on EC2:" -ForegroundColor White
Write-Host ""
Write-Host "   cd ~" -ForegroundColor Cyan
Write-Host "   git clone https://github.com/hazemyasserprg/notion-arabs.git" -ForegroundColor Cyan
Write-Host "   cd notion-arabs/backend" -ForegroundColor Cyan
Write-Host "   npm install" -ForegroundColor Cyan
Write-Host "   pm2 start ecosystem.config.js --env production" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. For future updates, run:" -ForegroundColor White
Write-Host "   cd ~/notion-arabs" -ForegroundColor Cyan
Write-Host "   git pull origin main" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   npm ci --production" -ForegroundColor Cyan
Write-Host "   pm2 restart notion-arabs-backend" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔗 Your GitHub repository: https://github.com/hazemyasserprg/notion-arabs.git" -ForegroundColor Magenta
Write-Host "🖥️  Your EC2 instance: ec2-50-19-23-245.compute-1.amazonaws.com" -ForegroundColor Magenta
