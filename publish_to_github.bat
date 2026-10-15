@echo off
setlocal enabledelayedexpansion
title Hilal Takaful - 1-Click GitHub Publish

echo ========================================================
echo    HILAL TAKAFUL WEBSITE - INSTANT GITHUB PUBLISH
echo ========================================================
echo.

set SCRIPT_DIR=%~dp0
set WEBSITE_DIR=%SCRIPT_DIR%hilal-takaful-website

if not exist "%WEBSITE_DIR%" (
  set WEBSITE_DIR=%SCRIPT_DIR%
) else (
  echo [1/3] Syncing latest edits from workspace to production folder...
  xcopy "%SCRIPT_DIR%*.html" "%WEBSITE_DIR%\" /Y /Q >nul 2>&1
  xcopy "%SCRIPT_DIR%assets\css\*" "%WEBSITE_DIR%\assets\css\" /E /Y /Q >nul 2>&1
  xcopy "%SCRIPT_DIR%assets\js\*" "%WEBSITE_DIR%\assets\js\" /E /Y /Q >nul 2>&1
  xcopy "%SCRIPT_DIR%assets\images\*" "%WEBSITE_DIR%\assets\images\" /E /Y /Q >nul 2>&1
)

cd /d "%WEBSITE_DIR%"

echo [2/3] Staging changes...
git add .

git diff --cached --quiet
if %errorlevel% equ 0 (
  echo.
  echo [INFO] No new changes detected. Everything is already up to date on GitHub!
  echo.
  goto :done
)

set COMMIT_MSG=Website update %date% %time%
set /p USER_MSG="Enter commit note (or press Enter to use default): "
if not "!USER_MSG!"=="" set COMMIT_MSG=!USER_MSG!

echo [3/3] Committing and pushing to HILAL-OFFICE/Hilal-Takaful-Insurance-website...
git commit -m "!COMMIT_MSG!"
git push origin main

if %errorlevel% equ 0 (
  echo.
  echo ========================================================
  echo   SUCCESS! All changes are now live on GitHub!
  echo   Repository: https://github.com/HILAL-OFFICE/Hilal-Takaful-Insurance-website
  echo ========================================================
) else (
  echo.
  echo [ERROR] Push failed. Please check your internet connection.
)

:done
echo.
pause
