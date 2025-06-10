// pages/api/cookies/check.js (dans backend sécurisé avec clé)

export default async function handler(req, res) {
  const { modelId } = req.query;
  const clientKey = req.headers['x-api-key'];

  const SERVER_SECRET = process.env.CHECK_API_KEY;

  if (!modelId || !clientKey || clientKey !== SERVER_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const response = await fetch(`http://163.172.134.56:3001/status/${modelId}`);
    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    console.error('Erreur de fetch VPS:', err);
    return res.status(500).json({ error: 'VPS unreachable' });
  }
}
