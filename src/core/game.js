import { GameInstance } from './gameInstance.js';

export function createGame(options) {
  return new GameInstance(options);
}
