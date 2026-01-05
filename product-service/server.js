require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let products = [
    { id: 1, name: 'Laptop Gaming', price: 15000000 },
    { id: 2, name: 'Mouse Wireless', price: 150000 }
];

app.get('/', (req, res) => res.send('Product Service OK'));

app.get('/products', (req, res) => {
    res.json(products);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`));