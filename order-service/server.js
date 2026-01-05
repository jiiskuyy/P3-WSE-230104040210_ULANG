require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios'); 
const app = express();

app.use(cors());
app.use(express.json());

// --- PERBAIKAN UTAMA (IP 127.0.0.1) ---
// Menggunakan IP eksplisit agar tidak Timeout / Hanging
const PRODUCT_URL = 'http://127.0.0.1:5001'; 
const NOTIF_URL = 'http://127.0.0.1:5003';   

// Database Sementara
const orders = [];

app.get('/', (req, res) => res.send('Order Service OK'));

// Endpoint: Buat Order Baru
app.post('/orders', async (req, res) => {
    // Ambil User ID dari Header (dikirim oleh Gateway)
    const userId = req.headers['x-user-id'] || 'guest';
    const username = req.headers['x-user-username'] || 'guest';
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
        return res.status(400).json({ message: 'Wajib isi productId dan quantity' });
    }

    try {
        console.log(`[ORDER] Mengecek produk ID ${productId} ke ${PRODUCT_URL}/products ...`);

        // 1. Cek Harga Barang ke Product Service
        const productRes = await axios.get(`${PRODUCT_URL}/products`);
        
        // Cari produk yang sesuai ID
        const product = productRes.data.find(p => p.id === Number(productId));
        
        if (!product) {
            console.log("[ORDER] Produk tidak ditemukan di daftar.");
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        const total = product.price * quantity;
        
        // 2. Simpan Order
        const newOrder = {
            id: orders.length + 1,
            userId,
            username,
            item: product.name,
            qty: Number(quantity),
            total,
            status: 'CREATED',
            createdAt: new Date().toISOString()
        };
        orders.push(newOrder);

        console.log(`[ORDER] Order berhasil dibuat: ID ${newOrder.id}`);

        // 3. Kirim Notifikasi (Fire & Forget)
        axios.post(`${NOTIF_URL}/notify`, {
            to: username,
            title: 'Order Berhasil',
            message: `Terima kasih! Pesanan ${quantity}x ${product.name} senilai Rp${total} berhasil.`
        }).catch(err => console.error("[ORDER] Gagal kirim notif (tapi order tetap sukses):", err.message));

        // 4. Respon Sukses ke Postman
        res.status(201).json({ message: 'Order berhasil dibuat', order: newOrder });

    } catch (error) {
        console.error("[ORDER] Error Fatal:", error.message);
        res.status(500).json({ message: 'Gagal memproses order', error: error.message });
    }
});

// Endpoint: Lihat Order Saya
app.get('/orders', (req, res) => {
    const userId = req.headers['x-user-id'];
    const myOrders = orders.filter(o => o.userId === userId);
    res.json(myOrders);
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));