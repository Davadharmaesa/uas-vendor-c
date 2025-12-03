require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db.js');

const app = express();
const PORT = process.env.PORT || 3000 ;

app.use(cors());
app.use(express.json());

//END POINT UTAMA 
app.get('/api/products', async (req, res) => {
    try{
        const result = await db.query('SELECT * FROM products ORDER BY id ASC');
        const nestedData = result.rows.map(rows => {
            return {
                id: rows.id,
                details:{
                    name: rows.name,
                    category: rows.category
                },
                pricing: {
                    base_price: rows.base_price,
                    tax: rows.tax
                },
                stock: rows.stock
            };
        });
        res.status(200).json(nestedData);
    } catch (err){
        console.error("Database Error:", err);
        res.status(500).json({ error: 'Gagal mengambil data dari server'});
    }
});

// === FALLBACK & ERROR HANDLING ===

app.get('/',  (req, res) => {
    res.send('API Vendor C (Neon DB) is running cuy');
});

app.listen(PORT, () =>{
    console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app;