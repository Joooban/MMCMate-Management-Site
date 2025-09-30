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
        // Check for duplicate description && category (100%)
        const duplicateCheck = await pool.query(
            'SELECT "Type", "Category" FROM "databaseBot" WHERE "Description" = $1 AND "Category" = $2 LIMIT 1',
            [Description, Category]
        );
        
        if (duplicateCheck.rows.length > 0) {
            const existing = duplicateCheck.rows[0];
            return res.status(409).json({ 
                error: 'Duplicate entry detected',
                message: `An entry with this exact description already exists under "${existing.Type}" in the ${existing.Category} category.`,
                isDuplicate: true
            });
        }

        // If no duplicate, proceed with insertion
        await pool.query(
            'SELECT public.add_databasebot_row($1, $2, $3, $4, $5, $6)',
            [ID, Type, Category, Description, Sanctions, Page]
        );
        
        res.json({ message: "Row added successfully!" });
        
    } catch (err) {
        console.error('Database error:', err);
        
        // Check if it's a network/connection error
        if (err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
            res.status(503).json({ error: 'Cannot connect to database. Please check your internet connection.' });
        } else {
            res.status(500).json({ error: 'Database error occurred.' });
        }
    }
});

// --- Start server ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('Connecting to:', process.env.DATABASE_URL);
});