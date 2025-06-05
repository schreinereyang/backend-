// utils/scriptEngine.js

export function getScriptedMessage(script, phaseName, memory) {
  // On récupère tous les steps de la phase actuelle
  const steps = script.filter(p => p.phase === phaseName);

  // On initialise la mémoire des steps utilisés si elle n’existe pas encore
  if (!memory.usedSteps) memory.usedSteps = [];

  for (const step of steps) {
    if (!memory.usedSteps.includes(step.step)) {
      // Marquer ce step comme utilisé
      memory.usedSteps.push(step.step);

      // S’il y a un média lié, on renvoie le teasing + tag MEDIA
      if (step.media) {
        return `${step.media.teasing}\n\n[MEDIA | ${step.media.id}]`;
      }

      // Sinon, on renvoie un message classique
      const msg = step.messages[Math.floor(Math.random() * step.messages.length)];
      return msg;
    }
  }

  // Si tous les steps sont utilisés, on improvise légèrement
  return "Je ne sais pas si tu es prêt pour la suite… 😏";
}