// utils/phaseEngine.js

export function getCurrentPhase(memory, funnel, lastUserMessage = "") {
  const isWordTriggering = (message, triggers) => {
    if (!message || !triggers) return false;
    const lower = message.toLowerCase();
    return triggers.some(trigger => lower.includes(trigger));
  };

  for (const phase of funnel.slice().reverse()) {
    if (phase.nextPhaseTriggerWords) {
      if (isWordTriggering(lastUserMessage, phase.nextPhaseTriggerWords)) {
        return phase;
      }
    }

    const allConditionsMet = (phase.conditions || []).every(condition => {
      if (condition === "memory.name") return !!memory.name;
      if (condition === "memory.age") return !!memory.age;
      if (condition === "memory.isAlone === true") return memory.isAlone === true;
      if (condition === "memory.isAlone === false") return memory.isAlone === false;
      if (condition === "purchaseMade") return memory.purchaseMade === true;
      return false;
    });

    if (allConditionsMet) {
      return phase;
    }
  }

  return funnel[0];
}

export function getRandomMessage(phase, lang = "fr") {
  if (!phase || !phase.messages) return "...";
  const messages = phase.messages[lang] || phase.messages["fr"];
  if (!messages || messages.length === 0) return "...";
  return messages[Math.floor(Math.random() * messages.length)];
}
