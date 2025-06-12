// pages/api/chat.js

import OpenAI from "openai";
import fs from "fs";
import path from "path";

import funnel from "../../utils/funnel/funnel.json";
import { extractMemoryFromMessage } from "../../utils/memory.js";
import { getCurrentPhase, getRandomMessage } from "../../utils/phaseEngine.js";
import { getScriptedMessage } from "../../utils/scriptEngine.js";
import { getMediaForPhase } from "../../utils/mediaEngine.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mémorisation des thread_id par fan
const fanThreads = {};

// Assistant + fichiers à configurer
const ASSISTANT_ID = "asst_r1l8vGPUUwmul0wGKDZiJj6m"; // 🔁 Remplace par ton ID
const FILE_IDS = [
  "file-Uqq5vvhMyYL7ACY9d2Jz1J",   // ← medias.json
  "file-BYErHKKt9LBBYEbtKk6Wfs"    // ← script_complete.json
]; // 🔁 Remplace par tes vrais file_ids

export default async function handler(req, res) {
  try {
    const { message, fanId } = req.body;

    if (!message || !fanId) {
      return res.status(400).json({ error: "Message ou fanId manquant" });
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

    // 🧠 Mise à jour mémoire
    global.memory = extractMemoryFromMessage(message, global.memory);
    console.log("🧠 Mémoire fan :", global.memory);

    // 🔁 Détecter phase
    const currentPhase = getCurrentPhase(global.memory, funnel, message);
    console.log("🚦 Phase détectée :", currentPhase?.name);

    // 🔒 Script verrouillé
    const lockedPhases = [
      "Sexting progressif",
      "Vente sexy",
      "Sexting + vente avancée",
      "Masturbation",
      "Blowjob fantasy",
      "Final penetration"
    ];

    if (lockedPhases.includes(currentPhase.name)) {
      const scriptPath = path.resolve("utils/funnel/script_complete.json");
      const funnelScript = JSON.parse(fs.readFileSync(scriptPath, "utf8"));

      let aiReply = getScriptedMessage(funnelScript, currentPhase.name, global.memory);
      const mediaPack = getMediaForPhase(currentPhase.name);
      if (mediaPack && !aiReply.includes("[MEDIA |")) {
        aiReply += `\\n\\n[MEDIA | ${mediaPack.id}]`;
      }

      return res.status(200).json({ reply: aiReply });
    }

    // Si pas de message défini dans funnel → GPT assistant
    const aiReply = getRandomMessage(currentPhase, "fr");

    if (aiReply === "...") {
      // ⛓ Créer ou réutiliser un thread
      if (!fanThreads[fanId]) {
        const thread = await openai.beta.threads.create();
        fanThreads[fanId] = thread.id;
      }

      const threadId = fanThreads[fanId];

      // Message fan
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message
      });

      // Lancer le run assistant
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: ASSISTANT_ID,
        instructions: "Utilise les fichiers joints pour suivre le bon script sexy selon la phase.",
        file_ids: FILE_IDS
      });

      let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      while (runStatus.status !== "completed") {
        await new Promise(r => setTimeout(r, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      }

      const messages = await openai.beta.threads.messages.list(threadId);
      const gptReply = messages.data[0].content[0].text.value;

      return res.status(200).json({ reply: gptReply });
    }

    // Réponse normale
    return res.status(200).json({ reply: aiReply });
  } catch (err) {
    console.error("💥 Erreur dans /api/chat :", err);
    return res.status(500).json({ error: "Erreur serveur dans chat.js" });
  }
}
"""

# Sauvegarder le nouveau fichier chat.js modifié
chat_js_path = "/mnt/data/chat_assistant_integrated.js"
with open(chat_js_path, "w", encoding="utf-8") as f:
    f.write(updated_chat_js.strip())

chat_js_path
