import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const client = await pool.connect();

    const messages = await client.query(`
      SELECT * FROM messages
      ORDER BY created_at DESC
      LIMIT 10
    `);

    client.release();

    const grouped: Record<string, { fan: string; user?: string; ia?: string }> = {};

    for (const msg of messages.rows) {
      const fan = msg.fan_id;
      if (!grouped[fan]) grouped[fan] = { fan };
      if (msg.sender === "fan" && !grouped[fan].user) grouped[fan].user = msg.text;
      if (msg.sender === "ia" && !grouped[fan].ia) grouped[fan].ia = msg.text;
    }

    const final = Object.values(grouped).slice(0, 2);

    return res.status(200).json({ messages: final });
  } catch (err) {
    console.error("Erreur /api/messages/latest:", err);
    return res.status(500).json({ error: "Erreur serveur PostgreSQL" });
  }
}
