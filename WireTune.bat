@echo off
title WireTune - Offline Network Optimizer
cd /d "%~dp0"
echo Starting WireTune...
if exist WireTune.exe (
  start "" "WireTune.exe"
) else (
  node src\desktop-launcher.js
)
if %errorlevel% neq 0 (
  echo.
  echo [ERROR] Failed to start WireTune.
  pause
)
