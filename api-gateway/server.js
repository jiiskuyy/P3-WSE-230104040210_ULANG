require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());

// --- TRICK ANTI HANGING ---
// Kita simpan json parser di variabel, JANGAN dipakai secara global dengan app.use()
const bodyParser = express.json(); 

// URL Service (Gunakan 127.0.0.1 agar stabil)
const AUTH_URL = process.env.AUTH_URL || 'http://127.0.0.1:4001';
const PRODUCT_URL = process.env.PRODUCT_URL || 'http://127.0.0.1:5001';
const ORDER_URL = process.env.ORDER_URL || 'http://127.0.0.1:5002';
const NOTIF_URL = process.env.NOTIF_URL || 'http://127.0.0.1:5003';

// Helper: Auth Middleware
async function authVerify(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token wajib ada (Bearer <token>)' });
    }
    try {
        const r = await axios.get(`${AUTH_URL}/verify`, { headers: { Authorization: auth } });
        req.user = r.data.user;
        req.headers['x-user-id'] = req.user.sub;
        req.headers['x-user-username'] = req.user.username;
        next();
    } catch (e) {
        return res.status(401).json({ message: 'Token tidak valid' });
    }
}

// 1. Auth (Login) - Pakai bodyParser DISINI saja
app.post('/auth/login', bodyParser, async (req, res) => {
    try {
        const r = await axios.post(`${AUTH_URL}/login`, req.body);
        res.json(r.data);
    } catch (e) {
        res.status(e.response?.status || 500).json(e.response?.data || { message: 'Login error' });
    }
});

// 2. Products (Routing yang Benar)
// Express sudah memotong '/api/products', jadi sisanya tinggal '/'.
// Kita ubah '/' menjadi '/products/' agar masuk ke endpoint data.
app.use('/api/products', authVerify, createProxyMiddleware({
    target: PRODUCT_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/products/' }, // <-- INI YANG BIKIN MUNCUL JSON
}));

// 3. Orders (Routing yang Benar)
app.use('/api/orders', authVerify, createProxyMiddleware({
    target: ORDER_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/orders/' },   // <-- Ubah '/' jadi '/orders/'
    onProxyReq: (proxyReq, req, res) => {
        if (req.user) {
            proxyReq.setHeader('x-user-id', req.user.sub);
            proxyReq.setHeader('x-user-username', req.user.username);
        }
    }
}));

// 4. Notifications (Routing yang Benar)
app.use('/api/notifications', authVerify, createProxyMiddleware({
    target: NOTIF_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/notifications/' }, // <-- Ubah '/' jadi '/notifications/'
    onProxyReq: (proxyReq, req, res) => {
        if (req.user) {
            proxyReq.setHeader('x-user-username', req.user.username);
        }
    }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));