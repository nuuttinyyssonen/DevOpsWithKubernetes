const express = require('express');
const app = express();
const { Pool } = require('pg');

app.use(express.json());

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: 5432,
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL
    );
  `);
}

initDb().catch(err => console.error('Failed to initialize database:', err));


app.get('/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, text FROM todos ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});

app.post('/todos', async (req, res) => {
    const { text } = req.body;

    if (!text || text.length > 140) {
        console.log(`Rejected todo: length ${text ? text.length : 0} exceeds 140 character limit`);
        return res.status(400).json({ error: 'Todo text is required and must be 140 characters or fewer' });
    }

    try {
        const result = await pool.query(
        'INSERT INTO todos (text) VALUES ($1) RETURNING id, text',
        [text]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Failed to save todo' });
    }
});

app.listen(PORT, () => {
    console.log(`Server started in port ${PORT}`);
});