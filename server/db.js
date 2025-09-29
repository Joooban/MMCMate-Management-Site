require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Supabase provides this
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

// Optional: log successful connections
pool.on('connect', () => {
    console.log('Database connection established ✅');
});

// Error handling
pool.on('error', (err) => {
    console.error('Unexpected database error', err);
});

// Export pool for async queries
module.exports = pool;