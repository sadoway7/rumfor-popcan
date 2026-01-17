@echo off
echo Starting Rumfor Market Tracker locally...
echo.

echo Starting backend server...
start "Backend" cmd /k "cd rumfor-market-tracker\backend && npm start"

timeout /t 5 /nobreak > nul

echo Starting frontend dev server...
start "Frontend" cmd /k "cd rumfor-market-tracker && npm run dev"

echo.
echo Servers starting up...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to close all servers...
pause > nul

echo Stopping servers...
taskkill /f /im node.exe > nul 2>&1
echo Done.