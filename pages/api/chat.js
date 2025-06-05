# Génération du fichier chat.js complet et commenté avec intégration des nouveaux modules

chat_js_code = """
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
  const { message } = req.body;

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

  // Mise à jour de la mémoire avec les infos du message
  global.memory = extractMemoryFromMessage(message, global.memory);
  console.log("Mémoire actuelle :", global.memory);

  // Détection de la phase actuelle
  const currentPhase = getCurrentPhase(global.memory, funnel, message);
  console.log("Phase actuelle détectée :", currentPhase?.name);

  // Détection langue
  const lang = /[a-zA-Z]/.test(message) && !/[éèàç]/i.test(message) ? "en" : "fr";

  let aiReply;

  // Si la phase est une phase verrouillée (sexting + vente), on applique le script
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

    // Si un média est disponible et pas encore appelé explicitement
    const mediaPack = getMediaForPhase(currentPhase.name);
    if (mediaPack && !aiReply.includes("[MEDIA |")) {
      aiReply += `\\n\\n[MEDIA | ${mediaPack.id}]`;
    }

    return res.status(200).json({ reply: aiReply });
  }

  // Sinon, réponse standard depuis le funnel
  aiReply = getRandomMessage(currentPhase, lang);

  // Si pas de message défini, fallback sur GPT
  if (aiReply === "...") {
    const memoryContext = `
Fan:
- Prénom: ${global.memory.name || "inconnu"}
- Âge: ${global.memory.age || "inconnu"}
- Est seul ? ${global.memory.isAlone === true ? "oui" : global.memory.isAlone === false ? "non" : "inconnu"}
`;

    const promptSystem = \`
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
\`;

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
    } catch (error) {
      console.error("Erreur GPT:", error);
      return res.status(500).json({ error: "Erreur GPT" });
    }
  }

  // Réponse finale classique
  res.status(200).json({ reply: aiReply });
}
"""

# Sauvegarde du fichier chat.js final
chat_js_path = "/mnt/data/chat_final.js"
with open(chat_js_path, "w", encoding="utf-8") as f:
    f.write(chat_js_code.strip())

chat_js_path
