@echo off
cd /d "%~dp0"
node server.js > task-backend.log 2>&1
