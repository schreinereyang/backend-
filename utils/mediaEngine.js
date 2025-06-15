import fs from 'fs';
import path from 'path';

// 🔗 Chargement du fichier medias.json
const mediaPath = path.resolve('utils/funnel/medias.json');
const medias = JSON.parse(fs.readFileSync(mediaPath, 'utf8'));

// 🔥 Mots-clés pour la détection hors-script
const CATEGORY_KEYWORDS = {
  ass: "fesses",
  booty: "fesses",
  butt: "fesses",
  fesses: "fesses",
  boobs: "seins",
  tits: "seins",
  seins: "seins",
  pov: "POV",
  lingerie: "lingerie",
  nue: "nudité",
  naked: "nudité",
  hot: "lingerie",
  show: "lingerie"
};

/**
 * 🎯 Média par PHASE — utilisé dans le funnel classique (vente scriptée)
 * @param {string} phaseName
 * @returns {object|null}
 */
export function getMediaForPhase(phaseName) {
  return medias.find(pack => pack.phase === phaseName) || null;
}

/**
 * 📦 Tous les IDs de packs funnel
 * @returns {string[]}
 */
export function listMediaPackIds() {
  return medias.map(p => p.id);
}

/**
 * 🔥 Sélection hors-script — cherche un média selon les mots sexy du fan
 * @param {string} userMessage
 * @returns {object|null}
 */
export function findBestMatchingMedia(userMessage) {
  const msg = userMessage.toLowerCase();

  let matchedCategory = null;
  for (const keyword in CATEGORY_KEYWORDS) {
    if (msg.includes(keyword)) {
      matchedCategory = CATEGORY_KEYWORDS[keyword];
      break;
    }
  }

  if (!matchedCategory) return null;

  const candidates = medias.filter(
    (m) => m.category?.toLowerCase() === matchedCategory
  );

  if (candidates.length === 0) return null;

  return candidates.sort((a, b) => b.price - a.price)[0];
}

/**
 * 💄 Formate un média pour l’envoi via OnlyFans
 * @param {object} media - un pack média (id, title, price...)
 * @returns {string}
 */
export function formatMediaForOnlyFans(media) {
  if (!media) return "";
  return `[MEDIA | ${media.id}] ${media.title} – ${media.price}€`;
}
