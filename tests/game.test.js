import { describe, expect, it } from 'vitest';
import { createGame } from '../src/core/game.js';

function createSequenceRng(values) {
  let index = 0;
  return () => values[index++ % values.length];
}

describe('partie', () => {
  it('rejette un générateur aléatoire qui n’est pas une fonction', () => {
    expect(() => createGame({ rng: 1 })).toThrow(
      'Le générateur aléatoire doit être une fonction.',
    );
  });

  it('rejette une grille initiale qui ne mesure pas 10x20', () => {
    expect(() => createGame({ initialGrid: [] })).toThrow(
      'La grille initiale doit mesurer 10x20.',
    );
  });

  it('rejette une valeur aléatoire hors intervalle', () => {
    expect(() => createGame({ rng: () => 1 })).toThrow(
      'Le générateur aléatoire doit retourner une valeur entre 0 et 1.',
    );
  });

    it('produit la même séquence avec le même RNG', () => {
    const game = createGame({ rng: createSequenceRng([0, 0.5, 0.99]) });

    expect(game.getState().current.type).toBe('I');
    expect(game.getState().next.type).toBe('S');
  });

  it('déplace et fait tourner la pièce courante si la position est valide', () => {
    const game = createGame({ rng: () => 0 });
    game.start();
    const initialState = game.getState();

    expect(game.moveLeft()).toBe(true);
    expect(game.getState().current.column).toBe(initialState.current.column - 1);
    expect(game.moveRight()).toBe(true);
    expect(game.rotate()).toBe(true);
    expect(game.getState().current.matrix).toEqual([
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ]);
  });

  it('fait descendre la pièce puis la fixe et fait apparaître la suivante', () => {
    const game = createGame({ rng: createSequenceRng([0, 0.5, 0.99]) });
    game.start();
    const initialState = game.getState();

    expect(game.drop()).toBe(true);
    expect(game.getState().current.row).toBe(initialState.current.row + 1);

    game.hardDrop();
    const nextState = game.getState();
    expect(nextState.current.type).toBe('S');
    expect(nextState.grid.some(row => row.includes('#00f0f0'))).toBe(true);
  });

  it('fixe la pièce quand une descente automatique atteint le bas', () => {
    const game = createGame({ rng: () => 0 });
    game.start();

    for (let index = 0; index < 20; index++) {
      game.drop();
    }

    expect(game.getState().grid.some(row => row.includes('#00f0f0'))).toBe(true);
  });

  it('passe en Game Over si la pièce suivante ne peut pas apparaître', () => {
    const initialGrid = Array.from({ length: 20 }, () => Array(10).fill(null));
    initialGrid[1][3] = '#ffffff';
    initialGrid[1][4] = '#ffffff';
    initialGrid[1][5] = '#ffffff';
    initialGrid[1][6] = '#ffffff';
    const game = createGame({ rng: () => 0, initialGrid });
    game.start();

    game.hardDrop();

    expect(game.getState().status).toBe('game-over');
    expect(game.getState().gameOver).toBe(true);
    expect(game.moveLeft()).toBe(false);
  });

  it('gère les transitions Start, Pause et Restart', () => {
    const game = createGame({ rng: () => 0 });

    expect(game.getState().status).toBe('ready');
    expect(game.start()).toBe(true);
    expect(game.getState().status).toBe('playing');
    expect(game.pause()).toBe(true);
    expect(game.getState().status).toBe('paused');
    expect(game.start()).toBe(true);
    expect(game.getState().status).toBe('playing');
    game.restart();
    expect(game.getState()).toMatchObject({
      status: 'ready',
      score: 0,
      lines: 0,
      level: 1,
    });
  });

  it('ignore les commandes de chute avant le démarrage', () => {
    const game = createGame({ rng: () => 0 });

    expect(game.drop()).toBe(false);
    expect(game.hardDrop()).toBe(false);
    expect(game.rotate()).toBe(false);
  });

  it('refuse de démarrer une partie déjà en cours', () => {
    const game = createGame({ rng: () => 0 });
    game.start();

    expect(game.start()).toBe(false);
  });

  it('refuse de mettre en pause une partie qui ne joue pas', () => {
    const game = createGame({ rng: () => 0 });

    expect(game.pause()).toBe(false);
  });
});
