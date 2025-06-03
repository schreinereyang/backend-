import OpenAI from "openai";
import funnel from "../../utils/funnel.json";
import { extractMemoryFromMessage } from "../../utils/memory";
import { getCurrentPhase, getRandomMessage } from "../../utils/phaseEngine";
import { liaPersona } from "../../utils/liaPersona";

// 🔐 Initialisation OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  const allowedOrigins = [
    "chrome-extension://ihifcomkeiifjhoepijbjgfhhjngjidn", // ← Ton extension Chrome
    "https://backend-rnei.vercel.app",
    "https://onlymoly.vercel.app"
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    return res.status(403).json({ error: "Forbidden: Origin not allowed" });
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  // ✅ Gestion des requêtes préflight CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // ✅ Initialisation mémoire globale
  if (!global.memory) {
    global.memory = {
      name: null,
      age: null,
      isAlone: null,
      lastMessages: [],
      purchaseMade: false,
    };
  }

  // ✅ Mise à jour de la mémoire
  global.memory = extractMemoryFromMessage(message, global.memory);
  console.log("🧠 Mémoire actuelle :", global.memory);

  // ✅ Détection de la phase active
  const currentPhase = getCurrentPhase(global.memory, funnel, message);
  console.log("🔎 Phase détectée :", currentPhase?.name);

  // ✅ Réponse directe du funnel si dispo
  const aiReply = getRandomMessage(currentPhase, "fr");

  if (aiReply !== "...") {
    return res.status(200).json({ reply: aiReply });
  }

  // ✅ Sinon → fallback GPT avec prompt personnalisé
  const memoryContext = `
Fan:
- Prénom: ${global.memory.name || "inconnu"}
- Âge: ${global.memory.age || "inconnu"}
- Est seul ? ${global.memory.isAlone === true ? "oui" : global.memory.isAlone === false ? "non" : "inconnu"}
`;

  const promptSystem = `
Tu es ${liaPersona.name}, une modèle OnlyFans ${liaPersona.tone} de ${liaPersona.origin}, 20 ans.
Objectif : ${liaPersona.goal}

Voici ce que tu sais sur le fan :
${memoryContext}

Règles :
- Ne repose pas une question déjà posée si tu connais la réponse
- Adapte-toi à ses mots
- S’il n’est pas seul, passe en mode "copine virtuelle" sans vendre

Style : ${liaPersona.style}
Personnalité : ${liaPersona.personality}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: promptSystem },
        { role: "user", content: message },
      ],
    });

    const gptReply = completion.choices?.[0]?.message?.content || "Je ne suis pas sûre d’avoir bien compris 😘";
    return res.status(200).json({ reply: gptReply });
  } catch (err) {
    console.error("❌ Erreur GPT:", err);
    return res.status(500).json({ error: "Erreur GPT" });
  }
}
