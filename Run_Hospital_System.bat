@echo off
title MediCare Hospital Management - Full System Launcher
echo ========================================================
echo       MediCare Hospital Management System Launcher
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking MySQL database...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MySQL is active.
) else (
    echo [INFO] Starting MySQL daemon...
    start /min "" "c:\xampp2\mysql\bin\mysqld.exe" --defaults-file="c:\xampp2\mysql\bin\my.ini" --standalone
    timeout /t 3 /nobreak >nul
)

echo [2/3] Checking Java Backend on Port 8080...
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if "%ERRORLEVEL%"=="0" (
    echo [OK] Java backend is already running on port 8080.
) else (
    echo [INFO] Starting Java backend...
    cd "backend\hospital-management"
    start "MediCare Spring Boot Backend" java -jar target\hospital-management-0.0.1-SNAPSHOT.jar
    cd /d "%~dp0"
    echo Waiting for backend to initialize...
    timeout /t 6 /nobreak >nul
)

echo [3/3] Opening MediCare Hospital Portal in browser...
start "" "http://127.0.0.1:5500/frontend/index.html"

echo.
echo ========================================================
echo       MediCare System is Ready & Running!
echo       Portal: http://127.0.0.1:5500/frontend/index.html
echo ========================================================
echo.
pause
