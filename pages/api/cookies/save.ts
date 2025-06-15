import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { modelId, cookie } = req.body;

  if (!modelId || !cookie) {
    return res.status(400).json({ error: 'Champs manquants (modelId, cookie)' });
  }

  try {
    const client = await pool.connect();

    // 📝 Enregistrer ou mettre à jour le cookie
    await client.query(`
      INSERT INTO onlyfans_cookies (model_id, cookie)
      VALUES ($1, $2)
      ON CONFLICT (model_id) DO UPDATE SET cookie = $2
    `, [modelId, cookie]);

    // ✅ Mettre à jour le statut de connexion dans la table models
    await client.query(`
      UPDATE models SET connected = true WHERE id = $1
    `, [modelId]);

    client.release();
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Erreur enregistrement cookie :', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
