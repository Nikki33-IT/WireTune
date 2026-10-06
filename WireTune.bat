@echo off
title WireTune - Offline Network Optimizer
cd /d "%~dp0"

where node >nul 2>&1
if %errorlevel% neq 0 (
  if exist "C:\node-js\node.exe" (
    set "PATH=C:\node-js;%PATH%"
  )
)

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
