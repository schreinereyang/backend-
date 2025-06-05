import OpenAI from "openai";
import { extractMemoryFromMessage } from "../../utils/memory";
import { liaPersona } from "../../utils/liaPersona";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!global.memory) global.memory = {};  // 🧠 initialisation globale multi-fan

export default async function handler(req, res) {
  const allowedOrigins = [
    "chrome-extension://ihifcomkeiifjhoepijbjgfhhjngjidn",
    "https://backend-onlymoly.vercel.app",
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

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { message, fanId = "fan_default" } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // ✅ Initialiser mémoire individuelle par fan
  if (!global.memory[fanId]) {
    global.memory[fanId] = {
      name: null,
      age: null,
      isAlone: null,
      purchaseMade: false,
      lastMessages: [], // format : { from: "fan"|"model", text: "..." }
    };
  }

  const mem = global.memory[fanId];

  // ✅ Mise à jour mémoire avec le message fan
  mem.lastMessages.push({ from: "fan", text: message });
  mem.lastMessages = mem.lastMessages.slice(-5);
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

Tu gères seule les phases suivantes :
1. Présentation
2. Validation prénom + âge
3. Vérification s’il est seul
4. Sexting progressif si seul
5. Vente sexy si fan demande à voir
6. Post-achat + vente avancée

Si tu veux vendre un contenu, écris-le dans ce format :

[MEDIA | titre : <titre sexy> | prix : <prix en $> | description : <description excitante du contenu>]

Règles :
- Ne repose pas une question déjà posée
- Ne force jamais la vente
- Si le fan n’est pas seul → reste en mode “copine douce”
- N’envoie le contenu payant que s’il chauffe ou le demande
- Ne fais pas deux fois le même compliment ou la même blague
- Ne dis pas que vous avez le même prénom si c’est déjà arrivé

Voici ce que tu sais :
${memoryContext}
`;

  // 🧠 Historique dernier échanges pour le contexte complet
  const history = mem.lastMessages.map((m) => ({
    role: m.from === "fan" ? "user" : "assistant",
    content: m.text,
  }));

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: promptSystem },
        ...history,
      ],
    });

    const gptReply = completion.choices?.[0]?.message?.content || "Je ne suis pas sûre d’avoir bien compris 😘";

    // 🔁 Mémorisation de la réponse GPT dans l'historique
    mem.lastMessages.push({ from: "model", text: gptReply });
    mem.lastMessages = mem.lastMessages.slice(-5);
    global.memory[fanId] = extractMemoryFromMessage(gptReply, mem);

    return res.status(200).json({ reply: gptReply });
  } catch (err) {
    console.error("❌ Erreur GPT:", err);
    return res.status(500).json({ error: "Erreur GPT" });
  }
}
