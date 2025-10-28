# Set Heroku Environment Variables
# Run this script to configure your Heroku app with required environment variables

Write-Host "`n=== Setting Heroku Environment Variables ===" -ForegroundColor Cyan

# Get values from user
Write-Host "`nPlease provide the following values:" -ForegroundColor Yellow
Write-Host "(You can press Enter to skip any variable you don't need to set)" -ForegroundColor Gray

# MongoDB URI
Write-Host "`nMongoDB URI (already set, type 'skip' to keep current):" -ForegroundColor Yellow
Write-Host "Current: mongodb+srv://hazemyasser911_db_user:NrXu9WygbI748apj@cluster0.cjrnbgd.mongodb.net/?retryWrites=true" -ForegroundColor Gray
$mongoUri = Read-Host "Enter MongoDB URI (or 'skip' to keep current)"
if ($mongoUri -ne "skip" -and $mongoUri -ne "") {
    heroku config:set MONGODB_URI=$mongoUri -a notion-arabs
}

# Frontend URL
Write-Host "`nFrontend URL:" -ForegroundColor Yellow
$frontendUrl = Read-Host "Enter frontend URL (default: https://notionarabs.com)"
if ($frontendUrl -eq "") { $frontendUrl = "https://notionarabs.com" }
heroku config:set FRONTEND_URL=$frontendUrl -a notion-arabs

# JWT Secret
Write-Host "`nJWT Secret:" -ForegroundColor Yellow
$jwtSecret = Read-Host "Enter JWT Secret (press Enter to skip)"
if ($jwtSecret -ne "") {
    heroku config:set JWT_SECRET=$jwtSecret -a notion-arabs
}

# Node Environment
heroku config:set NODE_ENV=production -a notion-arabs

# Google OAuth (optional)
Write-Host "`nGoogle OAuth Credentials (press Enter to skip):" -ForegroundColor Yellow
$googleClientId = Read-Host "Enter Google Client ID"
if ($googleClientId -ne "") {
    heroku config:set GOOGLE_CLIENT_ID=$googleClientId -a notion-arabs
    $googleClientSecret = Read-Host "Enter Google Client Secret"
    heroku config:set GOOGLE_CLIENT_SECRET=$googleClientSecret -a notion-arabs
}

# Email Configuration (optional)
Write-Host "`nEmail Configuration (press Enter to skip):" -ForegroundColor Yellow
$emailUser = Read-Host "Enter Email User"
if ($emailUser -ne "") {
    heroku config:set EMAIL_USER=$emailUser -a notion-arabs
    $emailPass = Read-Host "Enter Email Password"
    heroku config:set EMAIL_PASS=$emailPass -a notion-arabs
}

# Cloudinary (optional)
Write-Host "`nCloudinary Configuration (press Enter to skip):" -ForegroundColor Yellow
$cloudName = Read-Host "Enter Cloudinary Cloud Name"
if ($cloudName -ne "") {
    heroku config:set CLOUDINARY_CLOUD_NAME=$cloudName -a notion-arabs
    $cloudApiKey = Read-Host "Enter Cloudinary API Key"
    heroku config:set CLOUDINARY_API_KEY=$cloudApiKey -a notion-arabs
    $cloudApiSecret = Read-Host "Enter Cloudinary API Secret"
    heroku config:set CLOUDINARY_API_SECRET=$cloudApiSecret -a notion-arabs
}

Write-Host "`n=== Environment Variables Set ===" -ForegroundColor Green
Write-Host "View all configs with: heroku config -a notion-arabs" -ForegroundColor Cyan

