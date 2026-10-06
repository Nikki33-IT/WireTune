@echo off
title WireTune - Run as Administrator
cd /d "%~dp0"

net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Requesting Administrator privileges (UAC)...
  powershell -Command "Start-Process cmd.exe -ArgumentList '/c \"\"%~dp0WireTune.bat\"\"' -Verb RunAs"
  exit /b
)

echo Running WireTune with Administrator privileges...
if exist WireTune.exe (
  start "" "WireTune.exe"
) else (
  node src\desktop-launcher.js
)
if %errorlevel% neq 0 (
  pause
)
