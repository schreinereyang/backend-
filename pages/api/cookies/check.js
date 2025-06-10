// pages/api/cookies/check.js
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

export default async function handler(req, res) {
  const { modelId } = req.query;
  const clientKey = req.headers['x-api-key'];
  const SERVER_SECRET = process.env.CHECK_API_KEY;

  // 🔐 Vérification de sécurité
  if (!modelId || !clientKey || clientKey !== SERVER_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const client = await pool.connect();

    const result = await client.query(
      'SELECT connected FROM models WHERE id = $1 LIMIT 1',
      [modelId]
    );

    client.release();

    if (result.rows.length > 0) {
      return res.status(200).json({ connected: result.rows[0].connected === true });
    } else {
      return res.status(200).json({ connected: false });
    }
  } catch (err) {
    console.error('❌ Erreur PostgreSQL:', err);
    return res.status(500).json({ error: 'Database error' });
  }
}
