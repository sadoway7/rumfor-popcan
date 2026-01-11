@echo off
title Rumfor Market Tracker - Production Local Test
color 0B

echo.
echo ================================================
echo   Rumfor Market Tracker - Production Local Test
echo ================================================
echo.

echo [0/3] Checking current directory...
cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo [1/3] Setting up environment variables...
set MONGODB_URI=mongodb://localhost:27017/rumfor-market-tracker
echo MongoDB URI set to: %MONGODB_URI%

echo.
echo [2/3] Starting MongoDB (if not running)...
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
echo [3/3] Checking if production images exist...
docker images | findstr "rumfor-vpopcan" >nul
if %errorlevel% equ 0 (
    echo ✓ Production images found
) else (
    echo ✗ Production images not found locally
    echo.
    set /p choice="Build images now? (y/n): "
    if /i "%choice%"=="y" (
        echo.
        echo Building backend image...
        docker build -t rumfor-vpopcan-backend:latest ./backend
        if %errorlevel% neq 0 (
            echo ✗ Failed to build backend image
            pause
            exit /b 1
        )

        echo.
        echo Building frontend image...
        docker build -t rumfor-vpopcan-rumfor-app:latest .
        if %errorlevel% neq 0 (
            echo ✗ Failed to build frontend image
            pause
            exit /b 1
        )

        echo ✓ Images built successfully
    ) else (
        echo.
        echo Using development setup instead...
        call start-dev-windows.bat
        exit /b 0
    )
)

echo Starting production stack with docker-compose...
docker-compose -f docker-compose.prod.yml up -d

if %errorlevel% equ 0 (
    echo.
    echo ================================================
    echo   🚀 Production Stack Started Successfully!
    echo ================================================
    echo.
    echo Backend API:   http://localhost:3001
    echo Frontend App:  http://localhost:3000
    echo Health Check:  http://localhost:3001/api/health
    echo.
    echo To view logs: docker-compose -f docker-compose.prod.yml logs -f
    echo To stop: docker-compose -f docker-compose.prod.yml down
    echo.
    echo 💡 Press any key to close this window...
    pause >nul
) else (
    echo.
    echo ✗ Failed to start production stack
    echo Check the logs with: docker-compose -f docker-compose.prod.yml logs
    pause
    exit /b 1
)