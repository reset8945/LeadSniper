@echo off
chcp 65001 >nul
echo ============================================
echo   Start Chromium debug mode on port 19553
echo ============================================
echo.

rem Prefer Microsoft Edge, then fall back to Google Chrome.
set "BROWSER="
set "BROWSER_NAME="
set "PROFILE_NAME="
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    set "BROWSER_NAME=Microsoft Edge"
    set "PROFILE_NAME=.douyin_edge_profile"
)
if not defined BROWSER if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    set "BROWSER_NAME=Microsoft Edge"
    set "PROFILE_NAME=.douyin_edge_profile"
)
if not defined BROWSER if exist "%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER=%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"
    set "BROWSER_NAME=Microsoft Edge"
    set "PROFILE_NAME=.douyin_edge_profile"
)
if not defined BROWSER if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "BROWSER=C:\Program Files\Google\Chrome\Application\chrome.exe"
    set "BROWSER_NAME=Google Chrome"
    set "PROFILE_NAME=.douyin_chrome_profile"
)
if not defined BROWSER if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "BROWSER=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    set "BROWSER_NAME=Google Chrome"
    set "PROFILE_NAME=.douyin_chrome_profile"
)
if not defined BROWSER if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
    set "BROWSER_NAME=Google Chrome"
    set "PROFILE_NAME=.douyin_chrome_profile"
)

if not defined BROWSER (
    echo Microsoft Edge or Google Chrome was not found.
    echo Install a Chromium browser that supports --remote-debugging-port=19553.
    pause
    exit /b 1
)

echo Browser: %BROWSER_NAME%
echo Executable: %BROWSER%

rem Keep separate persistent profiles for Edge and Chrome.
set "DEBUG_PROFILE=%~dp0%PROFILE_NAME%"
if not exist "%DEBUG_PROFILE%" mkdir "%DEBUG_PROFILE%"

start "" "%BROWSER%" --remote-debugging-port=19553 --user-data-dir="%DEBUG_PROFILE%" --new-window "https://www.douyin.com/"

echo.
echo %BROWSER_NAME% started. Scan the Douyin QR code on the first run.
echo Run LeadSniper.exe check again after login.
echo.
pause
