@echo off
title MediCare Hospital Management - Start Backend
echo ========================================================
echo       Starting MediCare Java Spring Boot Backend
echo ========================================================
echo.

cd /d "%~dp0backend\hospital-management"

echo [1/2] Checking MySQL database...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MySQL is already running.
) else (
    echo [INFO] Starting MySQL...
    start /min "" "c:\xampp2\mysql\bin\mysqld.exe" --defaults-file="c:\xampp2\mysql\bin\my.ini" --standalone
    timeout /t 3 /nobreak >nul
)

echo [2/2] Launching Java Backend on Port 8080...
echo.
java -jar target\hospital-management-0.0.1-SNAPSHOT.jar

pause
