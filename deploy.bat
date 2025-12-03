@echo off
echo ========================================
echo WordTest Academy - Oracle Cloud Deployment
echo ========================================
echo.

REM 1. Frontend Build Skipped (Will build on server)
echo [1/4] Skipping local frontend build...

REM 2. Create deployment package
echo [2/4] Creating deployment package...
if exist deploy-package rmdir /s /q deploy-package
mkdir deploy-package
mkdir deploy-package\backend
mkdir deploy-package\frontend

REM Copy backend files
xcopy /E /I /Y backend\src deploy-package\backend\src
xcopy /E /I /Y backend\node_modules deploy-package\backend\node_modules
xcopy /E /I /Y backend\wallet deploy-package\backend\wallet
copy /Y backend\package.json deploy-package\backend\
copy /Y backend\package-lock.json deploy-package\backend\
copy /Y backend\ecosystem.config.js deploy-package\backend\
copy /Y backend\setup-all-tables.js deploy-package\backend\
copy /Y .env deploy-package\backend\

REM Copy frontend source files (for server-side build)
copy /Y frontend\package.json deploy-package\frontend\
copy /Y frontend\package-lock.json deploy-package\frontend\
copy /Y frontend\vite.config.js deploy-package\frontend\
copy /Y frontend\index.html deploy-package\frontend\
copy /Y frontend\postcss.config.js deploy-package\frontend\
copy /Y frontend\tailwind.config.js deploy-package\frontend\
copy /Y frontend\.env deploy-package\frontend\
xcopy /E /I /Y frontend\src deploy-package\frontend\src
xcopy /E /I /Y frontend\public deploy-package\frontend\public

echo Deployment package created!
echo.

REM 3. Create archive
echo [3/4] Creating archive...
powershell Compress-Archive -Path deploy-package\* -DestinationPath wordtest-deploy.zip -Force
echo Archive created: wordtest-deploy.zip
echo.

echo [4/4] Deployment package ready!
echo.
echo ========================================
echo Next Steps:
echo 1. Upload wordtest-deploy.zip to your server (134.185.119.70)
echo 2. SSH to server and extract the archive
echo 3. Run DB Setup: cd backend ^&^& node setup-all-tables.js
echo 4. Start Server: pm2 start ecosystem.config.js
echo ========================================
echo.
pause
