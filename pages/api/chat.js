// pages/api/chat.js

import OpenAI from "openai";
import funnel from "../../utils/funnel.json";
import { extractMemoryFromMessage } from "../../utils/memory";
import { getCurrentPhase, getRandomMessage } from "../../utils/phaseEngine";
import { liaPersona } from "../../utils/liaPersona";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  const { message } = req.body;

  // Initialiser la mémoire globale si elle n'existe pas
  if (!global.memory) {
    global.memory = {
      name: null,
      age: null,
      isAlone: null,
      lastMessages: [],
      purchaseMade: false,
    };
  }

  // Mise à jour de la mémoire
  global.memory = extractMemoryFromMessage(message, global.memory);
  console.log("Mémoire actuelle :", global.memory);

  // Détection de la phase
  const currentPhase = getCurrentPhase(global.memory, funnel, message);
  console.log("Phase actuelle détectée :", currentPhase?.name);

  // Génération de réponse simple (sans GPT si phase contient un message écrit)
  const aiReply = getRandomMessage(currentPhase, "fr"); // TODO : détecter "en" ou "fr" dynamiquement

  // (optionnel) Utiliser GPT uniquement si aucun message n’est défini
  if (aiReply === "...") {
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
    } catch (error) {
      console.error("Erreur GPT:", error);
      return res.status(500).json({ error: "Erreur GPT" });
    }
  }

  // Sinon, réponse générée depuis le funnel
  res.status(200).json({ reply: aiReply });
}
