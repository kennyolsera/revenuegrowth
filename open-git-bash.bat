@echo off
title Open Git Bash Here
cd /d "%~dp0\rgd-app"
if exist "%ProgramFiles%\Git\git-bash.exe" (
    start "" "%ProgramFiles%\Git\git-bash.exe" --cd="%~dp0\rgd-app"
) else if exist "%ProgramFiles(x86)%\Git\git-bash.exe" (
    start "" "%ProgramFiles(x86)%\Git\git-bash.exe" --cd="%~dp0\rgd-app"
) else if exist "%LocalAppData%\Programs\Git\git-bash.exe" (
    start "" "%LocalAppData%\Programs\Git\git-bash.exe" --cd="%~dp0\rgd-app"
) else (
    echo Git Bash tidak ditemukan di lokasi standar.
    echo Pastikan Git for Windows sudah terinstall di komputer Anda.
    pause
)
