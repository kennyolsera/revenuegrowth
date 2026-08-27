@echo off
setlocal enabledelayedexpansion
title Push Revenue Growth Dashboard to GitHub

echo ======================================================
echo   Mempersiapkan Push Update ke GitHub
echo ======================================================

cd /d "%~dp0"

:: Cari git.exe di berbagai lokasi umum
set "GIT_CMD=git"
where git >nul 2>&1
if %ERRORLEVEL% equ 0 goto GIT_FOUND

if exist "C:\Program Files\Git\cmd\git.exe" (
    set "GIT_CMD=C:\Program Files\Git\cmd\git.exe"
    goto GIT_FOUND
)
if exist "C:\Program Files\Git\bin\git.exe" (
    set "GIT_CMD=C:\Program Files\Git\bin\git.exe"
    goto GIT_FOUND
)
if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
    set "GIT_CMD=C:\Program Files (x86)\Git\cmd\git.exe"
    goto GIT_FOUND
)
if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
    set "GIT_CMD=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
    goto GIT_FOUND
)

echo [PERINGATAN] git.exe tidak ditemukan otomatis di PATH sistem.
echo Mencoba memanggil 'git'...
set "GIT_CMD=git"

:GIT_FOUND
echo Menggunakan Git: "%GIT_CMD%"
echo.

:: 1. Inisialisasi git jika belum ada
if not exist ".git" (
    echo [1/5] Inisialisasi git repository...
    "%GIT_CMD%" init
) else (
    echo [1/5] Git repository terdeteksi.
)

:: 2. Setup branch main
echo [2/5] Mengatur branch ke main...
"%GIT_CMD%" branch -M main

:: 3. Setup remote origin
echo [3/5] Mengatur remote repository...
"%GIT_CMD%" remote remove origin >nul 2>&1
"%GIT_CMD%" remote add origin https://github.com/kennyolsera/revenuegrowth.git

:: 4. Tambahkan file dan commit
echo [4/5] Menambahkan seluruh file terbaru dan commit...
"%GIT_CMD%" add -A
"%GIT_CMD%" commit -m "feat: bilingual ID/EN, collapsible sidebar, senior UI/UX polish"

:: 5. Push ke GitHub
echo [5/5] Melakukan push update ke GitHub...
"%GIT_CMD%" push -u origin main

echo.
echo ======================================================
echo   Proses Selesai! Cek Vercel untuk memantau auto-deploy.
echo ======================================================
pause
