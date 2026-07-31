@echo off
echo Starting Hidden Kerala Backend...
cd /d %~dp0backend
call ..\venv\Scripts\python manage.py runserver
