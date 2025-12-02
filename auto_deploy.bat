@echo off
setlocal
title WordTest Academy Auto Deploy

echo ===================================================
echo       WordTest Academy Auto Deployment Tool
echo ===================================================
echo.
echo I need your SSH Key file to connect to the server.
echo Please drag and drop your SSH key file (e.g., .pem, .key) here and press Enter:
echo.
set /p KEY_PATH=Key File Path: 

REM Remove quotes from path if present
set KEY_PATH=%KEY_PATH:"=%

if not exist "%KEY_PATH%" (
    echo.
    echo Error: Key file not found!
    echo Please try again.
    pause
    exit /b 1
)

echo.
echo [1/3] Uploading deployment package...
echo Using Key: %KEY_PATH%
echo Target: opc@134.185.119.70
echo.

scp -i "%KEY_PATH%" -o StrictHostKeyChecking=no wordtest-deploy.zip opc@134.185.119.70:~/wordtest-deploy.zip

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error: Upload failed!
    echo Please check your key file and internet connection.
    pause
    exit /b 1
)

echo.
echo [2/3] Extracting files on server...
echo.

ssh -i "%KEY_PATH%" -o StrictHostKeyChecking=no opc@134.185.119.70 "rm -rf backend frontend && unzip -o wordtest-deploy.zip && echo Extraction Complete"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error: Extraction failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Starting Server...
echo.

echo Starting server in background...
ssh -i "%KEY_PATH%" -o StrictHostKeyChecking=no opc@134.185.119.70 "cd backend && npm install --production && nohup npm start > app.log 2>&1 &"

echo.
echo ===================================================
echo       Deployment Complete!
echo ===================================================
echo.
echo You can now access the site at: http://134.185.119.70:3000
echo.
pause
