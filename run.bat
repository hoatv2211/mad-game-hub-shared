@echo off
setlocal

cd /d "%~dp0"

set "PORT=13000"
set "DOCS_DIR=docs"

if not exist "%DOCS_DIR%\index.html" (
    echo Cannot find %DOCS_DIR%\index.html
    echo Run this script from the repository root.
    pause
    exit /b 1
)

echo Starting MAD Game Hub preview...
echo URL: http://localhost:%PORT%/
echo Serving folder: %CD%\%DOCS_DIR%
echo.
echo Press Ctrl+C to stop the server.
echo.

where python >nul 2>nul
if %ERRORLEVEL%==0 (
    python -m http.server %PORT% --directory "%DOCS_DIR%"
    goto done
)

where py >nul 2>nul
if %ERRORLEVEL%==0 (
    py -m http.server %PORT% --directory "%DOCS_DIR%"
    goto done
)

echo Python was not found. Install Python or add it to PATH, then run this script again.
exit /b 1

:done
echo.
echo Server stopped.
pause
