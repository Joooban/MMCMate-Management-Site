require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db'); // PostgreSQL connection

const app = express();
const port = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'landing_page.html'));
});

// Automated add row to databasebot
app.post("/addDatabaseBot", async (req, res) => {
    const { ID, Type, Category, Description, Sanctions, Page } = req.body;

    try {
        // Call the Postgres function
        const result = await db.query(
            'SELECT * FROM public.add_databasebot_row($1, $2, $3, $4, $5, $6)',
            [ID, Type, Category, Description, Sanctions, Page]
        );

        const newRowId = result.rows[0].new_row_id;

        res.json({
            message: "Row added successfully!",
            rowId: newRowId
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message || "Database error" });
    }
});


/**WITHOUT FUNCTION AVAILABLE

app.post('/api/databasebot', async (req, res) => {
    const { ID, Type, Category, Description, Sanctions, Page } = req.body;
    try {
        await db.query(
            'INSERT INTO public.databasebot ("ID", "Type", "Category", "Description", "Sanctions", "Page") VALUES ($1, $2, $3, $4, $5, $6)',
            [ID, Type, Category, Description, Sanctions, Page]
        );
        res.status(201).json({ message: 'Row added successfully' });
    } catch (err) {
        console.error('Database insert error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port} ✅`);
});


 */