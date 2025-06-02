// pages/api/chat.js

import OpenAI from "openai";
import funnel from "../../utils/funnel.json";
import { extractMemoryFromMessage } from "../../utils/memory";
import { getCurrentPhase, getRandomMessage } from "../../utils/phaseEngine";
import { liaPersona } from "../../utils/liaPersona";

// Initialisation de l'API OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  const { message } = req.body || {};

  if (!message) {
    console.log("Aucun message reçu dans la requête");
    return res.status(400).json({ error: "Message is required" });
  }

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

  try {
    // Mise à jour de la mémoire
    global.memory = extractMemoryFromMessage(message, global.memory);
    console.log("Mémoire mise à jour :", global.memory);

    // Déterminer la phase du funnel
    const currentPhase = getCurrentPhase(global.memory, funnel, message);
    console.log("Phase actuelle :", currentPhase?.name);

    // Générer une réponse simple via le funnel
    const aiReply = getRandomMessage(currentPhase, "fr"); // TODO: auto-détection langue

    if (aiReply !== "...") {
      return res.status(200).json({ reply: aiReply });
    }

    // Si pas de réponse pré-définie, appel à GPT-4
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: promptSystem },
        { role: "user", content: message },
      ],
    });

    const gptReply = completion.choices?.[0]?.message?.content || "Je ne suis pas sûre d’avoir bien compris 😘";
    res.status(200).json({ reply: gptReply });
  } catch (error) {
    console.error("Erreur dans le handler API:", error);
    res.status(500).json({ error: "Erreur interne du serveur", details: error?.message || error });
  }
}
