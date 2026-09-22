const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: 5432,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS counter (
      id SERIAL PRIMARY KEY,
      count INTEGER NOT NULL
    );
  `);

  const result = await pool.query('SELECT * FROM counter LIMIT 1');
  if (result.rows.length === 0) {
    await pool.query('INSERT INTO counter (count) VALUES (0)');
  }
}

initDb().catch(err => console.error('Failed to initialize database:', err));

app.get('/', (req, res) => {
  res.status(200).send('ok');
});

app.get('/pingpong', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE counter SET count = count + 1 RETURNING count'
    );
    const count = result.rows[0].count;
    res.send(`pong ${count}`);
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).send('Database error');
  }
});

app.get('/pings', async (req, res) => {
  try {
    const result = await pool.query('SELECT count FROM counter LIMIT 1');
    res.send(result.rows[0].count.toString());
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).send('Database error');
  }
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});