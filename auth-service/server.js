require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Data User Dummy
const users = [
    { id: 1, username: 'mhs1', password: '123', role: 'student' },
    { id: 2, username: 'mhs2', password: '456', role: 'student' }
];

// Login Endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) return res.status(401).json({ message: 'Login gagal' });

    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({ message: 'Login sukses', token });
});

// Verify Endpoint (Dipanggil oleh Gateway)
app.get('/verify', (req, res) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token) return res.status(401).json({ valid: false });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (err) {
        res.status(401).json({ valid: false, error: err.message });
    }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));