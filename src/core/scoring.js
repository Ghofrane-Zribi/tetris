const LINE_SCORES = [0, 100, 300, 500, 800];
const BASE_DROP_INTERVAL = 700;
const MIN_DROP_INTERVAL = 100;
const DROP_INTERVAL_STEP = 60;

/**
 * Calcule le score obtenu après la suppression de lignes.
 * @param {number} clearedLines Nombre de lignes supprimées, de 0 à 4.
 * @param {number} [level=1] Niveau courant, utilisé comme multiplicateur.
 * @returns {number} Score gagné.
 * @throws {Error} Si le nombre de lignes ou le niveau est invalide.
 */
export function calculateScore(clearedLines, level = 1) {
  if (!Number.isInteger(clearedLines) || clearedLines < 0 || clearedLines > 4) {
    throw new Error('Le nombre de lignes supprimées doit être compris entre 0 et 4.');
  }
  if (!Number.isInteger(level) || level < 1) {
    throw new Error('Le niveau doit être un entier positif.');
  }

  return LINE_SCORES[clearedLines] * level;
}

/**
 * Calcule le niveau à partir du nombre total de lignes supprimées.
 * @param {number} lines Nombre de lignes supprimées.
 * @returns {number} Niveau correspondant.
 * @throws {Error} Si le nombre de lignes est invalide.
 */
export function getLevel(lines) {
  if (!Number.isInteger(lines) || lines < 0) {
    throw new Error('Le nombre de lignes doit être un entier positif ou nul.');
  }

  return Math.floor(lines / 10) + 1;
}

/**
 * Calcule l’intervalle de chute d’une pièce.
 * @param {number} level Niveau courant.
 * @returns {number} Intervalle de chute en millisecondes.
 * @throws {Error} Si le niveau est invalide.
 */
export function getDropInterval(level) {
  if (!Number.isInteger(level) || level < 1) {
    throw new Error('Le niveau doit être un entier positif.');
  }

  return Math.max(MIN_DROP_INTERVAL, BASE_DROP_INTERVAL - (level - 1) * DROP_INTERVAL_STEP);
}
