@echo off
echo ========================================
echo       Family Tree App - Start Script
echo ========================================
echo.

echo [1/3] Starting MongoDB...
echo.
echo IMPORTANT: Make sure MongoDB is installed and running.
echo If you don't have MongoDB installed, you can:
echo   1. Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
echo   2. Or use MongoDB Atlas (cloud) and update MONGODB_URI in backend/.env
echo.
pause

echo.
echo [2/3] Starting Backend Server...
cd backend
start "Backend Server" cmd /k npm run dev
cd ..

timeout /t 5 /nobreak > nul

echo.
echo [3/3] Starting Frontend Server...
cd frontend  
start "Frontend Server" cmd /k npm run dev
cd ..

echo.
echo ========================================
echo   ✓ Application Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window.
echo (Servers will continue running in separate windows)
pause > nul
