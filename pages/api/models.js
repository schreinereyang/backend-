// pages/api/models.js
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  try {
    const result = await pool.query('SELECT * FROM models ORDER BY created_at DESC');
    res.status(200).json({ models: result.rows });
  } catch (error) {
    console.error('Erreur de requête PostgreSQL :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
