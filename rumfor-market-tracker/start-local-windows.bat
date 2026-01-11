@echo off
title Rumfor Market Tracker - Local Development
color 0A

echo.
echo ================================================
echo   Rumfor Market Tracker - Local Development
echo ================================================
echo.

echo [1/4] Checking current directory...
cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo [2/4] Starting MongoDB...
docker ps | findstr "rumfor-mongodb" >nul
if %errorlevel% equ 0 (
    echo ✓ MongoDB container already running
) else (
    echo Starting MongoDB container...
    docker run -d --name rumfor-mongodb -p 27017:27017 mongo:latest
    if %errorlevel% equ 0 (
        echo ✓ MongoDB container started
    ) else (
        echo ✗ Failed to start MongoDB container
        echo Please ensure Docker is running and try again
        pause
        exit /b 1
    )
)

echo.
echo [3/4] Installing backend dependencies...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
) else (
    echo ✓ Backend dependencies already installed
)

echo.
echo [4/4] Installing frontend dependencies...
cd ..
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
) else (
    echo ✓ Frontend dependencies already installed
)

echo.
echo Starting Backend Server...
echo Backend will start on http://localhost:3001
start "Backend Server" cmd /k "cd /d %~dp0backend && echo Starting backend in %CD% && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Application...
echo Frontend will start on http://localhost:5173
start "Frontend App" cmd /k "cd /d %~dp0 && echo Starting frontend in %CD% && npm run dev"

echo.
echo ================================================
echo   🚀 Local Development Stack Started!
echo ================================================
echo.
echo Backend API:   http://localhost:3001
echo Frontend App:  http://localhost:5173
echo Health Check:  http://localhost:3001/api/health
echo.
echo 💡 Login should now work with JWT secrets configured
echo 💡 Press any key to close this window...
pause >nul