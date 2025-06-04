export function extractMemoryFromMessage(message, memory) {
  if (!message || typeof message !== "string") return memory;

  const updatedMemory = { ...memory };
  const safeName = (name) =>
    name &&
    name.length >= 2 &&
    name.length <= 20 &&
    !["Eli", "Moi", "Toi"].includes(name);

  updatedMemory.lastMessages = [...(updatedMemory.lastMessages || []), message].slice(-5);

  // 🔁 Toujours mettre à jour le prénom si on le détecte
  const nameMatchFR = message.match(/(?:je m'appelle|moi c.?est|appelle[- ]?moi|je suis)\s+([A-ZÀ-Ÿ][a-zà-ÿ\-']{2,})/i);
  const nameMatchEN = message.match(/(?:my name is|i'?m|i am)\s+([A-ZÀ-Ÿ][a-zà-ÿ\-']{2,})/i);

  const detectedName = nameMatchFR?.[1] || nameMatchEN?.[1];
  if (safeName(detectedName)) updatedMemory.name = detectedName;

  const ageMatch = message.match(/\b(?:j'ai|i'?m|i am)\s+(\d{2})\s*(?:ans|yo|years?)?/i);
  if (ageMatch) {
    const age = parseInt(ageMatch[1], 10);
    if (age >= 18 && age <= 99) updatedMemory.age = age;
  }

  const lower = message.toLowerCase();
  if (lower.includes("je suis seul") || lower.includes("i'm alone") || lower.includes("im alone")) {
    updatedMemory.isAlone = true;
  } else if (
    lower.includes("je ne suis pas seul") ||
    lower.includes("i'm not alone") ||
    lower.includes("im not alone")
  ) {
    updatedMemory.isAlone = false;
  }

  return updatedMemory;
}
