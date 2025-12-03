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
        const nestedData = result.rows.map(row => formatToNested(row));
        res.status(200).json(nestedData);
    } catch (err){
        console.error("Database Error:", err);
        res.status(500).json({ error: 'Gagal mengambil data dari server'});
    }
});

// === GET BY ID ===
app.get('/api/products/:id', async (req, res) => {
    try{
        const {id} = req.params;
        const result = await db.query('SELECT * FROM products WHERE id = $1', [id] );

        if(result.rows.length === 0){
            return res.status(404).json({ error: 'Produk tidak ditemukan'});
        }
        res.status(200).json(formatToNested(result.rows[0]));
    } catch (err){
        console.error("Database Error:", err);
        res.status(500).json({ error: 'Gagal mengambil data dari server'});
    }
});

// === POST CREATE ===

app.post('/api/products', async (req, res) => {
    try{
        const {details, pricing, stock} = req.body;

        if(!details || !pricing || !stock){
            return res.status(400).json({ error: 'Format harus ada (details, pricing, stock)'});
        }

        const name = details.name;
        const category = details.category;
        const base_price = pricing.base_price;
        const tax = pricing.tax;

        const sql = `INSERT INTO products (name, category, base_price, tax, stock)
                     VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const value = [name, category, base_price, tax, stock];

        const result = await db.query(sql, value);

        res.status(201).json(formatToNested(result.rows[0]));
        
    } catch (err){
        console.error("Database Error:", err);
        res.status(500).json({ error: 'Gagal menyimpan data'});
    }
});

app.put('/api/products/:id', async (req, res) => {
    try{
        const {id} = req.params;
        const {details, pricing, stock} = req.body;

        const check = await db.query(`SELECT * FROM products WHERE id = $1`, [id]);
        if(check.rows.length === 0){
            return res.status(400).json({ error: 'Produk tidak ditemukan'});
        }

        const name = details.name;
        const category = details.category;
        const base_price = pricing.base_price;
        const tax = pricing.tax;

        const sql = `UPDATE products 
                     SET name = $1, category = $2, base_price = $3, tax = $4, stock = $5
                     WHERE id = $6 RETURNING *`;
        const value = [name, category, base_price, tax, stock, id];

        const result = await db.query(sql, value);
        res.status(201).json(formatToNested(result.rows[0]));
        
    } catch (err){
        console.error("Database Error:", err);
        res.status(500).json({ error: 'Gagal update data'});
    }
});

// === DELETE HAPUS ===
app.delete('/api/products/:id', async (req, res) => {
    try{
        const {id} = req.params;
        const result = await db.query(`DELETE FROM products WHERE id = $1 RETURNING *`, [id]);
        if(result.rows.length === 0){
            return res.status(404).json({ error: 'Produk tidak ditemukan'});
        }
        res.status(200).json({ message: 'Produk berhasil dihapus', deletedItem: formatToNested(result.rows[0]) });
        
    } catch (err){
        console.error(err);
        res.status(500).json({ error: 'Gagal menghapus data'});
    }
});

// FUNGSI HELPER
function formatToNested(row){
    return{
        id: row.id,
        details: {
            name: row.name,
            category: row.category
        },
        pricing: {
            base_price: row.base_price,
            tax: row.tax
        },
        stock: row.stock
    };
}
// === FALLBACK & ERROR HANDLING ===

app.get('/',  (req, res) => {
    res.send('API Vendor C (Neon DB) is running cuy');
});

app.listen(PORT, () =>{
    console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app;