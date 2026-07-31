@echo off
echo ========================================
echo   Hidden Kerala - Backend Setup
echo ========================================
echo.

cd /d %~dp0

echo [1/4] Installing Python dependencies...
call venv\Scripts\pip install -r backend\requirements.txt
if errorlevel 1 (
    echo ERROR: pip install failed!
    pause
    exit /b 1
)
echo.

echo [2/4] Running database migrations...
cd backend
call ..\venv\Scripts\python manage.py migrate
if errorlevel 1 (
    echo ERROR: Migration failed!
    pause
    exit /b 1
)
echo.

echo [3/4] Seeding database with sample Kerala places...
call ..\venv\Scripts\python manage.py seed_data
echo.

echo [4/4] Done! Now create a superuser for admin access:
echo.
call ..\venv\Scripts\python manage.py createsuperuser
echo.

echo ========================================
echo   Setup complete!
echo   Run: start_backend.bat to start server
echo ========================================
pause
