#!/bin/bash
# ==========================================================
# Script Push ke GitHub untuk Revenue Growth Dashboard
# ==========================================================

echo "======================================================"
echo "  Mempersiapkan Push ke GitHub (kennyolsera/revenuegrowth)"
echo "======================================================"

# Pindah ke direktori tempat script berada
cd "$(dirname "$0")"

# 1. Inisialisasi Git jika belum ada
if [ ! -d ".git" ]; then
    echo "[1/5] Inisialisasi git repository baru..."
    git init
else
    echo "[1/5] Git repository sudah ada."
fi

# 2. Setup branch main
echo "[2/5] Mengatur branch ke main..."
git branch -M main

# 3. Setup remote origin
echo "[3/5] Mengatur remote origin ke https://github.com/kennyolsera/revenuegrowth.git..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/kennyolsera/revenuegrowth.git

# 4. Tambahkan file dan commit
echo "[4/5] Menambahkan file & membuat commit..."
git add .
git commit -m "Update Revenue Growth Dashboard" || echo "Tidak ada perubahan baru untuk di-commit."

# 5. Push ke GitHub
echo "[5/5] Melakukan push ke GitHub..."
echo "Jika diminta login, silakan ikuti petunjuk login browser/token yang muncul..."
git push -u origin main

echo ""
echo "======================================================"
echo "  Proses selesai! Tekan tombol apa saja untuk keluar."
echo "======================================================"
read -n 1 -s -r -p ""
