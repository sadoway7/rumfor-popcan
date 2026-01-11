@echo off
title Rumfor Market Tracker - Local Development (No Docker)
color 0A

echo.
echo ================================================
echo   Rumfor Market Tracker - Local Development
echo   (No Docker - Requires Local MongoDB)
echo ================================================
echo.

echo [1/3] Checking current directory...
cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo [2/3] Installing backend dependencies...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
) else (
    echo ✓ Backend dependencies already installed
)

echo.
echo [3/3] Installing frontend dependencies...
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
echo Make sure MongoDB is running locally on port 27017
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
echo 💡 Ensure MongoDB is installed and running locally
echo 💡 Press any key to close this window...
pause >nul