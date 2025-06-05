// utils/mediaEngine.js

import fs from 'fs';
import path from 'path';

const mediaPath = path.resolve('utils/funnel/medias.json');
const medias = JSON.parse(fs.readFileSync(mediaPath, 'utf8'));

/**
 * Récupère le pack média correspondant à une phase donnée
 * @param {string} phaseName - Nom de la phase (doit correspondre au champ "phase" du pack)
 * @returns {object|null} - Pack média complet (titre, vidéos, teasing, etc.)
 */
export function getMediaForPhase(phaseName) {
  return medias.find(pack => pack.phase === phaseName) || null;
}

/**
 * Récupère tous les IDs de packs disponibles
 */
export function listMediaPackIds() {
  return medias.map(p => p.id);
}