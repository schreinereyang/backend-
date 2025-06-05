// chat.js
import OpenAI from "openai";
import { extractMemoryFromMessage } from "../../utils/memory";
import { liaPersona } from "../../utils/liaPersona";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  const allowedOrigins = [
    "chrome-extension://ihifcomkeiifjhoepijbjgfhhjngjidn",
    "https://backend-onlymoly.vercel.app",
    "https://onlymoly.vercel.app",
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

  if (req.method === "OPTIONS") return res.status(200).end();

  const { message, fanId } = req.body || {};
  if (!message || !fanId) return res.status(400).json({ error: "Message and fanId are required" });

  if (!global.memory) global.memory = {};
  if (!global.memory[fanId]) {
    global.memory[fanId] = {
      name: null,
      age: null,
      isAlone: null,
      purchaseMade: false,
      history: [], // historisation GPT
    };
  }

  const mem = global.memory[fanId];
  global.memory[fanId] = extractMemoryFromMessage(message, mem);

  const memoryContext = `
Fan :
- Prénom : ${mem.name || "inconnu"}
- Âge : ${mem.age || "inconnu"}
- Est seul ? ${mem.isAlone === true ? "oui" : mem.isAlone === false ? "non" : "inconnu"}
- A déjà acheté ? ${mem.purchaseMade ? "oui" : "non"}
`;

  const promptSystem = `
Tu es ${liaPersona.name}, une modèle OnlyFans ${liaPersona.tone}, 20 ans, originaire de ${liaPersona.origin}.
Tu es douce, joueuse, sexy, très attentive à ton fan.

Ton objectif :
- Séduire et instaurer une complicité
- Monter doucement en intensité
- Proposer un contenu sexy au bon moment
- Relancer après achat
- Rebondir naturellement s’il est silencieux

Tu gères les phases :
1. Présentation
2. Prénom + âge
3. Est-il seul ?
4. Sexting progressif
5. Vente sexy [MEDIA | ...]
6. Post-achat

Règles :
- Ne repose pas une question déjà posée
- Ne force jamais la vente
- Si le fan n’est pas seul → mode "copine douce"
- Ne fais pas deux fois le même compliment ou la même blague

Ce que tu sais :
${memoryContext}`;

  try {
    // On ajoute le message fan à l'historique
    mem.history.push({ role: "user", content: message });
    mem.history = mem.history.slice(-10); // max 10

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: promptSystem },
        ...mem.history,
      ],
    });

    const gptReply = completion.choices?.[0]?.message?.content || "Je ne suis pas sûre d’avoir compris 😘";
    mem.history.push({ role: "assistant", content: gptReply });
    mem.history = mem.history.slice(-10);

    global.memory[fanId] = extractMemoryFromMessage(gptReply, mem);

    return res.status(200).json({ reply: gptReply });
  } catch (err) {
    console.error("❌ Erreur GPT:", err);
    return res.status(500).json({ error: "Erreur GPT" });
  }
}
