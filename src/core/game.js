import { GameInstance } from './gameInstance.js';

/**
 * Crée une partie individuelle.
 * @param {Object} [options] Options transmises à GameInstance.
 * @returns {GameInstance} Nouvelle instance de partie.
 * @throws {Error} Si les options de la partie sont invalides.
 */
export function createGame(options) {
  return new GameInstance(options);
}
