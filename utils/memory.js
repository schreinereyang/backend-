// memory.js

export function extractMemoryFromMessage(message, memory) {
  const updatedMemory = { ...memory };

  // Historique des derniers messages (max 5)
  updatedMemory.lastMessages = [...(updatedMemory.lastMessages || []), message].slice(-5);

  // Détection prénom (FR)
  const nameMatchFR = message.match(/(?:je m'appelle|moi c.?est|je suis) ([A-ZÀ-ſ][a-zÀ-ſ]+)/i);
  if (nameMatchFR && !updatedMemory.name) updatedMemory.name = nameMatchFR[1];

  // Détection prénom (EN, avec accents et variantes)
  const nameMatchEN = message.match(/(?:my name is|i'?m|i am) ([A-ZÀ-ſ][a-zÀ-ſ]+)/i);
  if (nameMatchEN && !updatedMemory.name) updatedMemory.name = nameMatchEN[1];

  // Détection de l'âge (formulations variées)
  const ageMatch = message.match(/\b(?:i'?m|i am|j'ai|age is|just turned|about)?\s*(\d{2})\s*(?:ans|yo|years? old)?\b/i);
  if (ageMatch && !updatedMemory.age) {
    const ageNum = parseInt(ageMatch[1], 10);
    if (ageNum >= 18 && ageNum <= 99) updatedMemory.age = ageMatch[1];
  }

  // Détection disponibilité (seul / pas seul)
  const lower = message.toLowerCase();
  if (lower.includes("je suis seul") || lower.includes("i'm alone") || lower.includes("im alone")) {
    updatedMemory.isAlone = true;
  } else if (lower.includes("je ne suis pas seul") || lower.includes("i'm not alone") || lower.includes("im not alone")) {
    updatedMemory.isAlone = false;
  }

  return updatedMemory;
}
