import { describe, expect, it } from 'vitest';
import { GameInstance } from '../src/core/gameInstance.js';

describe('GameInstance', () => {
  it('crée une partie avec son pseudo et un état prêt', () => {
    const game = new GameInstance({ pseudo: 'Alice', rng: () => 0 });

    expect(game.getState()).toMatchObject({
      pseudo: 'Alice',
      status: 'ready',
      score: 0,
      level: 1,
      lines: 0,
    });
  });

  it('redémarre la partie en conservant son pseudo', () => {
    const game = new GameInstance({ pseudo: 'Alice', rng: () => 0 });
    game.start();
    game.hardDrop();

    game.restart();

    expect(game.getState()).toMatchObject({
      pseudo: 'Alice',
      status: 'ready',
      score: 0,
      level: 1,
      lines: 0,
    });
  });
});
