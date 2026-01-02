@echo off
title Rumfor Market Tracker - Development Stack
color 0A

echo.
echo ================================================
echo   Rumfor Market Tracker - Development Stack
echo ================================================
echo.

echo [1/5] Checking if MongoDB container exists...
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
echo [2/5] Installing backend dependencies (if needed)...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
) else (
    echo ✓ Backend dependencies already installed
)

echo.
echo [3/5] Installing frontend dependencies (if needed)...
cd ..
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
) else (
    echo ✓ Frontend dependencies already installed
)

echo.
echo [4/5] Starting Backend Server...
echo Backend will start on http://localhost:3001
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [5/5] Starting Frontend Application...
echo Frontend will start on http://localhost:5173
start "Frontend App" cmd /k "npm run dev"

echo.
echo ================================================
echo   🚀 Development Stack Starting!
echo ================================================
echo.
echo Backend API:   http://localhost:3001
echo Frontend App:  http://localhost:5173
echo Health Check:  http://localhost:3001/api/health
echo.
echo 💡 Press any key to close this window...
pause >nul