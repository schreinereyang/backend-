# Génération du fichier chat.js final avec tout intégré : langage naturel, 3 phrases max, style fille de 20 ans

chat_js_final_code = """
// pages/api/chat.js

import OpenAI from "openai";
import fs from "fs";
import path from "path";

import funnel from "../../utils/funnel/funnel.json";
import { extractMemoryFromMessage } from "../../utils/memory.js";
import { getCurrentPhase, getRandomMessage } from "../../utils/phaseEngine.js";
import { getScriptedMessage } from "../../utils/scriptEngine.js";
import { getMediaForPhase } from "../../utils/mediaEngine.js";
import { liaPersona } from "../../utils/liaPersona.js";

// Charger le script verrouillé
const scriptPath = path.resolve("utils/funnel/script_complete.json");
const funnelScript = JSON.parse(fs.readFileSync(scriptPath, "utf8"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message manquant" });
    }

    if (!global.memory) {
      global.memory = {
        name: null,
        age: null,
        isAlone: null,
        lastMessages: [],
        purchaseMade: false,
        usedSteps: []
      };
    }

    // Mise à jour de la mémoire
    global.memory = extractMemoryFromMessage(message, global.memory);
    console.log("🧠 Mémoire fan :", global.memory);

    // Phase actuelle
    const currentPhase = getCurrentPhase(global.memory, funnel, message);
    console.log("🚦 Phase détectée :", currentPhase?.name);

    // Détection langue
    const lang = /[a-zA-Z]/.test(message) && !/[éèàç]/i.test(message) ? "en" : "fr";

    let aiReply;

    // 🔒 Si phase verrouillée → script + vente
    const lockedPhases = [
      "Sexting progressif",
      "Vente sexy",
      "Sexting + vente avancée",
      "Masturbation",
      "Blowjob fantasy",
      "Final penetration"
    ];

    if (lockedPhases.includes(currentPhase.name)) {
      aiReply = getScriptedMessage(funnelScript, currentPhase.name, global.memory);

      const mediaPack = getMediaForPhase(currentPhase.name);
      if (mediaPack && !aiReply.includes("[MEDIA |")) {
        aiReply += `\\n\\n[MEDIA | ${mediaPack.id}]`;
      }

      return res.status(200).json({ reply: aiReply });
    }

    // 🧠 Sinon, message standard funnel
    aiReply = getRandomMessage(currentPhase, lang);

    // 📡 Si aucun message défini → fallback GPT
    if (aiReply === "...") {
      const memoryContext = `
Fan:
- Prénom: ${global.memory.name || "inconnu"}
- Âge: ${global.memory.age || "inconnu"}
- Est seul ? ${global.memory.isAlone === true ? "oui" : global.memory.isAlone === false ? "non" : "inconnu"}
`;

      const promptSystem = \`
Tu es ${liaPersona.name}, une modèle OnlyFans de 20 ans, originaire d'Argentine. Tu es douce, sexy et joueuse.

🧠 Objectif :
Créer une vraie complicité avec le fan et l’exciter subtilement.

📌 Contexte :
${memoryContext}

🎯 Règles :
- Ne commence pas chaque message par "Hey", "Hola", "Bonjour"
- Ne dis pas “je suis Eli” plusieurs fois, une seule suffit
- Varie tes débuts : réagis, taquine, enchaîne sans toujours poser de questions
- Ne répète pas les mêmes infos
- Si tu connais prénom ou âge → ne redemande pas
- Si le fan n’est pas seul, reste douce et calme
- Si le fan est chaud → monte doucement

🗣️ Style :
- Langage **très simple**, **jeune**, **sans tournure compliquée**
- **Jamais soutenu**
- **Maximum 3 phrases par message**
- Si c’est plus long → coupe en deux messages
- Écris comme une fille de 20 ans sur Insta ou WhatsApp : naturel, spontané, direct
- Varie le ton : parfois une question, un mot, un emoji, un rire…

💋 Exemples :
"tu veux savoir ?"  
"j’te dis pas 😏"  
"t’as pensé à moi ? 🥺"  
"c’est ta faute 😈"  
"j’me suis filmée là... 🫣"
\`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: promptSystem },
            { role: "user", content: message },
          ],
        });

        const gptReply = completion.choices?.[0]?.message?.content || "Hmm… tu veux que je recommence ? 😘";
        return res.status(200).json({ reply: gptReply });
      } catch (error) {
        if (error.code === "insufficient_quota") {
          console.warn("⛔ Quota OpenAI dépassé !");
          return res.status(503).json({ reply: "Je suis un peu à bout de souffle là... Essaie encore dans quelques instants 😘" });
        }

        console.error("💥 Erreur GPT:", error);
        return res.status(500).json({ error: "Erreur GPT" });
      }
    }

    res.status(200).json({ reply: aiReply });
  } catch (err) {
    console.error("💥 Erreur dans /api/chat :", err);
    return res.status(500).json({ error: "Erreur serveur dans chat.js" });
  }
}
"""

# Sauvegarde du fichier final
final_chat_path = "/mnt/data/chat_final_ultra_naturel.js"
with open(final_chat_path, "w", encoding="utf-8") as f:
    f.write(chat_js_final_code.strip())

final_chat_path
