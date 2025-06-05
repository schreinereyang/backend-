import OpenAI from "openai";
import funnel from "../../utils/funnel_auto_full.json";
import { extractMemoryFromMessage } from "../../utils/memory";
import { liaPersona } from "../../utils/liaPersona";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  if (req.method === "OPTIONS") return res.status(200).end();

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "Message is required" });

  if (!global.memory) {
    global.memory = {
      name: null,
      age: null,
      isAlone: null,
      lastMessages: [],
      purchaseMade: false,
      phase: 1,
    };
  }

  global.memory = extractMemoryFromMessage(message, global.memory);
  console.log("🧠 Mémoire fan :", global.memory);

  const phase = funnel.find(p => p.id === global.memory.phase);
  const messages = phase?.messages || [];
  const notUsed = messages.filter(m => !global.memory.lastMessages?.includes(m.text));

  if (notUsed.length > 0) {
    const aiReply = notUsed[Math.floor(Math.random() * notUsed.length)].text;
    global.memory.lastMessages.push(aiReply);
    if (global.memory.lastMessages.length > 5) global.memory.lastMessages.shift();

    if (phase.autoNext) global.memory.phase++;
    return res.status(200).json({ reply: aiReply });
  }

  const memoryContext = `
Fan :
- Prénom : ${global.memory.name || "inconnu"}
- Âge : ${global.memory.age || "inconnu"}
- Est seul ? ${global.memory.isAlone === true ? "oui" : global.memory.isAlone === false ? "non" : "inconnu"}
- A déjà acheté ? ${global.memory.purchaseMade ? "oui" : "non"}
- Phase actuelle : ${global.memory.phase || 1}
`;

  const promptSystem = `
Tu es ${liaPersona.name}, une modèle OnlyFans ${liaPersona.tone}, 20 ans, originaire de ${liaPersona.origin}.
Tu es douce, joueuse, sexy, très attentive à ton fan.

Objectif :
- Crée une vraie complicité
- Fais-le parler
- Monte en intensité
- Propose un contenu sexy quand il est chaud (jamais trop tôt)
- Relance s’il est silencieux

⚠️ Tu es dans la phase ${global.memory.phase} : ${phase?.name || "inconnue"}

Tu peux t’inspirer de ces idées :
${phase?.messages.map(m => "- " + m.text).join("\n") || "- Aucune idée fournie"}

${memoryContext}
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

    global.memory.lastMessages.push(gptReply);
    if (global.memory.lastMessages.length > 5) global.memory.lastMessages.shift();

    // 🧠 mise à jour mémoire depuis la réponse GPT aussi
    global.memory = extractMemoryFromMessage(gptReply, global.memory);

    if (phase?.autoNext) global.memory.phase++;
    return res.status(200).json({ reply: gptReply });
  } catch (err) {
    console.error("❌ Erreur GPT:", err);
    return res.status(500).json({ error: "Erreur GPT" });
  }
}
