import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "GET") return res.status(405).end();

  try {
    const client = await pool.connect();

    const modelRes = await client.query(`
      SELECT * FROM models WHERE id = $1
    `, [id]);

    if (modelRes.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: "Modèle non trouvé" });
    }

    const model = modelRes.rows[0];

    const messagesRes = await client.query(`
      SELECT text FROM messages WHERE model_id = $1 ORDER BY created_at DESC LIMIT 10
    `, [id]);

    const salesRes = await client.query(`
      SELECT COALESCE(SUM(price), 0) AS earnings FROM sales WHERE model_id = $1
    `, [id]);

    client.release();

    return res.status(200).json({
      model: {
        id: model.id,
        name: model.name,
        age: model.age,
        active: model.active,
        created_at: model.created_at,
        earnings: parseFloat(salesRes.rows[0].earnings),
        recentMessages: messagesRes.rows.map((m) => m.text)
      }
    });
  } catch (err) {
    console.error("❌ Erreur modèle /api/models/[id]:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
