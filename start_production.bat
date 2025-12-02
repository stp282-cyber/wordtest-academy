@echo off
echo Starting WordTest Academy Platform (Production Mode)...
echo.
echo 1. Setting environment variables...
set NODE_ENV=production

echo 2. Starting Backend Server (Hosting Frontend)...
cd backend
npm start
pause
