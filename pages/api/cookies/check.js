// pages/api/cookies/check.js

export default async function handler(req, res) {
  const { modelId } = req.query;
  const clientKey = req.headers['x-api-key'];
  const SERVER_SECRET = process.env.CHECK_API_KEY;

  // Sécurité : bloquer toute requête non autorisée
  if (!modelId || !clientKey || clientKey !== SERVER_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const response = await fetch(`http://localhost:3001/status/${modelId}`, {
      headers: {
        'Accept': 'application/json',
      },
      timeout: 3000, // (optionnel) si tu utilises axios, sinon ignorer
    });

    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Erreur de connexion au backend VPS:', err.message || err);
    return res.status(500).json({ error: 'VPS unreachable' });
  }
}
