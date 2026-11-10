@echo off
title Internship Portal Launcher
echo Starting Internship & Job Portal...
start "Backend (Port 5000)" cmd /k "cd /d ""%~dp0backend"" && node server.js"
start "Frontend (Port 5173)" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"
echo Backend and Frontend launched!
echo Open http://localhost:5173 in your browser.
