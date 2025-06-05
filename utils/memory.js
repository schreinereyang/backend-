export function extractMemoryFromMessage(message, memory) {
  if (!message || typeof message !== "string") return memory;

  const updatedMemory = { ...memory };

  // 🧠 Historique des derniers messages
  updatedMemory.lastMessages = [...(updatedMemory.lastMessages || []), message].slice(-5);

  // 🔄 Détection prénom (FR)
  const nameMatchFR = message.match(/(?:je m'appelle|moi c.?est|je suis) ([A-ZÀ-ÿ][a-zÀ-ÿ]+)/i);
  if (nameMatchFR) updatedMemory.name = nameMatchFR[1];

  // 🔄 Détection prénom (EN)
  const nameMatchEN = message.match(/(?:my name is|i am|i'?m) ([A-ZÀ-ÿ][a-zÀ-ÿ]+)/i);
  if (nameMatchEN) updatedMemory.name = nameMatchEN[1];

  // 🔄 Détection âge
  const ageMatch = message.match(/\b(?:i'?m|i am|j'ai|age is|just turned)?\s*(\d{2})\s*(?:ans|yo|years? old)?\b/i);
  if (ageMatch) {
    const ageNum = parseInt(ageMatch[1], 10);
    if (ageNum >= 18 && ageNum <= 99) updatedMemory.age = ageMatch[1];
  }

  // 🔄 Détection solitude
  const lower = message.toLowerCase();
  if (lower.includes("je suis seul") || lower.includes("i'm alone") || lower.includes("im alone")) {
    updatedMemory.isAlone = true;
  } else if (lower.includes("je ne suis pas seul") || lower.includes("i'm not alone") || lower.includes("im not alone")) {
    updatedMemory.isAlone = false;
  }

  // ✅ Phase automatique si fan donne prénom, âge ou dit qu’il est seul
  if (updatedMemory.name && updatedMemory.age && typeof updatedMemory.isAlone === "boolean") {
    updatedMemory.phase = Math.max(updatedMemory.phase || 1, 4); // passe au sexting
  } else if (updatedMemory.name && updatedMemory.age) {
    updatedMemory.phase = Math.max(updatedMemory.phase || 1, 3);
  } else if (updatedMemory.name) {
    updatedMemory.phase = Math.max(updatedMemory.phase || 1, 2);
  }

  return updatedMemory;
}
