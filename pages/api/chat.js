import OpenAI from "openai";
import fs from "fs";
import path from "path";

import funnel from "../../utils/funnel/funnel.json";
import { extractMemoryFromMessage } from "../../utils/memory";
import { getCurrentPhase, getRandomMessage } from "../../utils/phaseEngine";
import { getScriptedMessage } from "../../utils/scriptEngine";
import { getMediaForPhase, findBestMatchingMedia, formatMediaForOnlyFans } from "../../utils/mediaEngine";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Mémorisation des thread_id par fan
const fanThreads = {};

// Assistant + fichiers (modifie selon ton compte)
const ASSISTANT_ID = "asst_r1l8vGPUUwmul0wGKDZiJj6m";
const FILE_IDS = [
  "file-Uqq5vvhMyYL7ACY9d2Jz1J", // medias.json
  "file-BYErHKKt9LBBYEbtKk6Wfs" // script_complete.json
];

export default async function handler(req, res) {
  try {
    const { message, fanId } = req.body;

    if (!message || !fanId) {
      return res.status(400).json({ error: "Message ou fanId manquant" });
    }

    // Initialiser la mémoire globale
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

    global.memory = extractMemoryFromMessage(message, global.memory);
    console.log("🧠 Mémoire fan :", global.memory);

    const currentPhase = getCurrentPhase(global.memory, funnel, message);
    console.log("🚦 Phase détectée :", currentPhase?.name);

    const lockedPhases = [
      "Sexting progressif",
      "Vente sexy",
      "Sexting + vente avancée",
      "Masturbation",
      "Blowjob fantasy",
      "Final penetration"
    ];

    // 📦 Vente scriptée si phase verrouillée
    if (lockedPhases.includes(currentPhase.name)) {
      const scriptPath = path.resolve("utils/funnel/script_complete.json");
      const funnelScript = JSON.parse(fs.readFileSync(scriptPath, "utf8"));

      let aiReply = getScriptedMessage(funnelScript, currentPhase.name, global.memory);
      const mediaPack = getMediaForPhase(currentPhase.name);
      if (mediaPack && !aiReply.includes("[MEDIA |")) {
        aiReply += `\n\n[MEDIA | ${mediaPack.id}]`;
      }

      return res.status(200).json({ reply: aiReply });
    }

    // GPT si pas de message défini
    const aiReply = getRandomMessage(currentPhase, "fr");

    if (aiReply === "...") {
      // 🔄 Créer ou réutiliser un thread
      if (!fanThreads[fanId]) {
        const thread = await openai.beta.threads.create();
        fanThreads[fanId] = thread.id;
      }

      const threadId = fanThreads[fanId];

      // Envoie du message fan
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message
      });

      // Lancer le run
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: ASSISTANT_ID,
        instructions: "Utilise les fichiers joints pour suivre le bon script sexy selon la phase.",
        file_ids: FILE_IDS
      });

      let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      while (runStatus.status !== "completed") {
        await new Promise((r) => setTimeout(r, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      }

      const messages = await openai.beta.threads.messages.list(threadId);
      const gptReply = messages.data[0].content[0].text.value;

      // 🔥 Vérifie si le fan est chaud (demande hors-script)
      const media = findBestMatchingMedia(message);
      if (media) {
        const { message: sexyMsg, media: content } = formatMediaForOnlyFans(media, "fr");

        return res.status(200).json({
          reply: sexyMsg,
          contentToSend: {
            url: content.url,
            price: content.price
          }
        });
      }

      return res.status(200).json({ reply: gptReply });
    }

    // Réponse simple
    return res.status(200).json({ reply: aiReply });
  } catch (err) {
    console.error("💥 Erreur dans /api/chat :", err);
    return res.status(500).json({ error: "Erreur serveur dans chat.js" });
  }
}
