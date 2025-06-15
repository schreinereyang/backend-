// /pages/api/models/add.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, age } = req.body;

  if (!name || !age) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    const client = await pool.connect();

    const insert = await client.query(`
      INSERT INTO models (name, age, active, connected)
      VALUES ($1, $2, false, false)
      RETURNING id
    `, [name, age]);

    client.release();
    return res.status(200).json({ modelId: insert.rows[0].id });
  } catch (err) {
    console.error('❌ Erreur création modèle :', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
