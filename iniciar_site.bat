@echo off
echo Iniciando o site Flask...
cd /d %~dp0Backend
call ..\venv\Scripts\activate
python app.py
pause
