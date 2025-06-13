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
        (SELECT COALESCE(SUM(price), 0) FROM sales) AS revenueTotal,
        (SELECT COUNT(*) FROM messages) AS messagesEnvoyes,
        (SELECT COUNT(*) FROM sales) AS mediasVendus,
        (SELECT COUNT(*) FROM subscribers WHERE active = true) AS abonnesActifs,
        (SELECT COUNT(*) FROM models WHERE active = true) AS modelesActifs
    `);

    client.release();

    const stats = result.rows[0];
    return res.status(200).json({ stats });
  } catch (err) {
    console.error("Erreur /api/stats:", err);
    return res.status(500).json({ error: "Erreur serveur PostgreSQL" });
  }
}
