// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

// --- Database connection ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // needed for Supabase
});

// Optional: log successful connections
pool.on('connect', () => {
    console.log('✅ Database connection established');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error', err);
});

// --- Express setup ---
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); // serve CSS/JS correctly

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// --- API endpoint ---
app.post("/addDatabaseBot", async (req, res) => {
    const { ID, Type, Category, Description, Sanctions, Page } = req.body;

    try {
        await pool.query(
            'SELECT public.add_databasebot_row($1, $2, $3, $4, $5, $6)',
            [ID, Type, Category, Description, Sanctions, Page]
        );

        res.json({ message: "Row added successfully!" });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// --- Start server ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('Connecting to:', process.env.DATABASE_URL);
});