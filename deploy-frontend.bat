@echo off
echo ========================================
echo Frontend Deployment Script
echo ========================================
echo.

echo [1/3] Building frontend...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Uploading to server...
cd ..
scp -i ssh-key-2025-11-30.key -o StrictHostKeyChecking=no -r frontend\dist\* ubuntu@134.185.119.70:~/frontend-new/

echo.
echo [3/3] Deploying on server...
ssh -i ssh-key-2025-11-30.key -o StrictHostKeyChecking=no ubuntu@134.185.119.70 "sudo rm -rf /var/www/wordtest/* && sudo cp -r ~/frontend-new/* /var/www/wordtest/ && sudo chown -R www-data:www-data /var/www/wordtest && sudo chmod -R 755 /var/www/wordtest"

echo.
echo ========================================
echo Deployment completed!
echo ========================================
pause
