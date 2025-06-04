import OpenAI from "openai";
import { extractMemoryFromMessage } from "../../utils/memory";
import { liaPersona } from "../../utils/liaPersona";

// 🔐 Initialisation OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // ✅ CORS sécurisé
  const allowedOrigins = [
    "chrome-extension://ihifcomkeiifjhoepijbjgfhhjngjidn",
    "https://backend-rnei.vercel.app",
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

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // ✅ Mémoire fan
  if (!global.memory) {
    global.memory = {
      name: null,
      age: null,
      isAlone: null,
      lastMessages: [],
      purchaseMade: false,
    };
  }

  global.memory = extractMemoryFromMessage(message, global.memory);
  console.log("🧠 Mémoire fan :", global.memory);

  // ✅ Construction du prompt GPT intelligent
  const memoryContext = `
Fan :
- Prénom : ${global.memory.name || "inconnu"}
- Âge : ${global.memory.age || "inconnu"}
- Est seul ? ${global.memory.isAlone === true ? "oui" : global.memory.isAlone === false ? "non" : "inconnu"}
- A déjà acheté ? ${global.memory.purchaseMade ? "oui" : "non"}
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

Si tu veux vendre un contenu, écris comme ceci :
[MEDIA | titre : "Vidéo lingerie 😈" | prix : 15 | description : "Je me suis filmée rien que pour toi… en lingerie rouge 😏"]

Règles :
- Ne repose pas une question déjà posée
- Ne force jamais la vente
- Si le fan n’est pas seul → reste en mode “copine douce”
- N’envoie le contenu payant que s’il chauffe ou le demande

Voici ce que tu sais :
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
    return res.status(200).json({ reply: gptReply });
  } catch (err) {
    console.error("❌ Erreur GPT:", err);
    return res.status(500).json({ error: "Erreur GPT" });
  }
}
