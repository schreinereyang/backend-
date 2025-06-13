import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const client = await pool.connect();

    const result = await client.query(`
      SELECT
        m.id,
        m.name,
        m.age,
        m.active,
        COALESCE(SUM(s.price), 0) AS revenueTotal
      FROM models m
      LEFT JOIN sales s ON s.model_id = m.id
      WHERE m.active = true
      GROUP BY m.id
    `);

    client.release();

    return res.status(200).json({ models: result.rows });
  } catch (err) {
    console.error("Erreur /api/models/active:", err);
    return res.status(500).json({ error: "Erreur serveur PostgreSQL" });
  }
}
