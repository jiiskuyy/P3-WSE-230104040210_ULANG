require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-Memory Storage
const notifications = [];

app.get('/', (req, res) => res.send('Notification Service OK'));

// Ambil notifikasi milik user tertentu
app.get('/notifications', (req, res) => {
    // Header user disisipkan oleh Gateway
    const user = req.headers['x-user-username'] || req.headers['x-user-id'] || 'unknown';
    const myNotif = notifications.filter(n => n.to === user);
    res.json({ data: myNotif, total: myNotif.length });
});

// Buat notifikasi baru (biasanya dipanggil oleh Order Service)
app.post('/notify', (req, res) => {
    const { to, title, message } = req.body || {};
    if (!to) return res.status(400).json({ message: 'Target user (to) wajib diisi' });

    const notif = {
        id: notifications.length + 1,
        to,
        title: title || 'Info',
        message: message || '',
        ts: new Date().toISOString()
    };
    
    notifications.push(notif);
    console.log(`[NOTIF] Untuk ${to}: ${title}`);
    res.status(201).json({ message: 'Notifikasi dibuat', data: notif });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));