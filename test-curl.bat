@echo off
echo Testing Screenshot API Endpoints...
echo.

echo 1. Testing Health Endpoint:
curl -X GET http://localhost:5000/api/screenshot/health
echo.
echo.

echo 2. Testing Debug Endpoint (No Auth):
curl -X POST http://localhost:5000/api/screenshot/debug ^
  -H "Content-Type: application/json" ^
  -d "{\"url\": \"https://notion.so/your-page-url\"}"
echo.
echo.

echo 3. Testing Main Endpoint (With Auth - will fail without token):
curl -X POST http://localhost:5000/api/screenshot ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
  -d "{\"url\": \"https://notion.so/your-page-url\"}"
echo.
echo.

echo Tests completed!
pause
