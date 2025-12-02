@echo off
echo ========================================
echo WordTest Academy - Oracle Cloud Deployment
echo ========================================
echo.

REM 1. Frontend Build
echo [1/4] Building Frontend...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo Frontend build completed!
echo.

REM 2. Create deployment package
echo [2/4] Creating deployment package...
cd ..
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
copy /Y .env deploy-package\backend\

REM Copy frontend build
xcopy /E /I /Y frontend\dist deploy-package\frontend\dist

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
echo 3. Run: cd backend ^&^& npm start
echo ========================================
echo.
pause
