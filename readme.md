#!/bin/bash

# =================================================================
# Script Otomatis: Generate README & Run Microservices
# Nama: Muhammad Hifzi (Berdasarkan NIM pada Folder)
# NIM: 230104040210
# =================================================================

# Warna terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📝 Membuat file readme.md...${NC}"

# 1. GENERATE README.MD
cat <<EOF > readme.md
# Microservices E-Commerce Architecture 🚀

Proyek ini adalah implementasi arsitektur Microservices menggunakan Node.js dan Express untuk memenuhi Tugas Praktikum 3 Web Service Engineering.

**Identitas Pengembang:**
* **Nama:** Muhammad Hifzi
* **NIM:** 230104040210
* **Kelas:** A

## 📁 Struktur Folder Proyek
Berdasarkan susunan repositori \`P3_WSE_230104040210_ULANG\`:

\`\`\`text
P3_WSE_230104040210_ULANG/
├── api-gateway/            # Entry point & Routing
│   ├── package.json
│   └── server.js
├── assets/                 # Dokumentasi Arsitektur
│   └── diagram-arsitektur.jpg.jpg
├── auth-service/           # Layanan Autentikasi (JWT)
│   ├── package.json
│   └── server.js
├── evidence/               # Screenshot Hasil Testing (PNG)
│   ├── Cek Kotak Masuk (Notification Service) VSCode.png
│   ├── Cek Kotak Masuk (Notification Service).png
│   ├── Cek Produk (Gateway - Product Service).png
│   ├── Login (Mendapatkan Kunci Masuk).png
│   └── Membuat Order (The Big Test!).png
├── notification-service/   # Layanan Notifikasi
│   ├── package.json
│   └── server.js
├── order-service/          # Layanan Transaksi & Order
│   ├── package.json
│   └── server.js
├── product-service/        # Layanan Katalog Produk
│   ├── package.json
│   └── server.js
├── .gitignore
└── readme.md
\`\`\`

## 🏗️ Arsitektur Service
Sistem terdiri dari 5 komponen utama:
1. **API Gateway (Port 3000)**
2. **Auth Service (Port 4001)**
3. **Product Service (Port 5001)**
4. **Order Service (Port 5002)**
5. **Notification Service (Port 5003)**

## 🚀 Cara Menjalankan (Otomatis via Script)
Gunakan script bash untuk menjalankan semua layanan sekaligus:
\`\`\`bash
chmod +x setup_project.sh
./setup_project.sh
\`\`\`

---
EOF

echo -e "${GREEN}✅ readme.md berhasil diperbarui.${NC}"

# 2. PROSES SETUP & RUNNING
echo -e "${YELLOW}📦 Menginstall dependencies...${NC}"
SERVICES=("auth-service" "product-service" "notification-service" "order-service" "api-gateway")

for service in "${SERVICES[@]}"; do
    if [ -d "$service" ]; then
        echo -e "Memproses ${GREEN}$service${NC}..."
        (cd $service && npm install) > /dev/null 2>&1
    fi
done

# Buat file .env secara otomatis
echo "PORT=3000" > ./api-gateway/.env
echo "AUTH_URL=http://127.0.0.1:4001" >> ./api-gateway/.env
echo "PRODUCT_URL=http://127.0.0.1:5001" >> ./api-gateway/.env
echo "ORDER_URL=http://127.0.0.1:5002" >> ./api-gateway/.env
echo "NOTIF_URL=http://127.0.0.1:5003" >> ./api-gateway/.env

# Menjalankan Service
cleanup() {
    echo -e "\n${YELLOW}🛑 Mematikan semua service...${NC}"
    kill $(jobs -p)
    exit
}
trap cleanup SIGINT

echo -e "${BLUE}⚡ Menjalankan semua service...${NC}"
cd auth-service && npm run dev & 
cd product-service && npm run dev & 
cd notification-service && npm run dev & 
cd order-service && npm run dev & 
sleep 2
cd api-gateway && npm run dev &

wait

