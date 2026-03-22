@echo off
color 0a
title TeamTruth Application Starter

echo ===================================================
echo       Starting TeamTruth Web Application
echo ===================================================
echo.

echo [1/2] Starting Backend Server...
:: %~dp0 gets the drive and path of the folder where this batch file is located
start "TeamTruth Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo [2/2] Starting Frontend Development Server...
start "TeamTruth Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both services have been launched in separate terminal windows.
echo You can close this window now, or press any key to exit.
echo ===================================================
pause > nul
