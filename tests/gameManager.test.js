import { describe, expect, it } from 'vitest';
import { createGrid } from '../src/core/grid.js';
import { GameManager } from '../src/core/gameManager.js';

describe('GameManager', () => {
  it('crée une partie solo avec un joueur humain', () => {
    const manager = new GameManager({ mode: 'solo', pseudo: 'Alice', rng: () => 0 });
    const state = manager.getState();

    expect(state.players).toHaveLength(1);
    expect(state.players[0]).toMatchObject({
      pseudo: 'Alice',
      isHuman: true,
      alive: true,
    });
  });

  it('crée quatre parties avec un humain et trois adversaires inactifs', () => {
    const manager = new GameManager({
      mode: 'versus-3',
      pseudo: 'Alice',
      rng: () => 0,
    });
    const state = manager.getState();

    expect(state.players).toHaveLength(4);
    expect(state.players.map(player => player.pseudo)).toEqual([
      'Alice',
      'Adversaire 1',
      'Adversaire 2',
      'Adversaire 3',
    ]);
    expect(state.players.slice(1).every(player => player.status === 'ready')).toBe(true);
  });

  it('désigne le dernier joueur vivant comme gagnant', () => {
    const blockedGrid = createGrid();
    blockedGrid[1].splice(3, 4, '#ffffff', '#ffffff', '#ffffff', '#ffffff');
    const manager = new GameManager({
      mode: 'versus-1',
      rng: () => 0,
      initialGrids: [blockedGrid, createGrid()],
    });

    manager.start();
    manager.hardDrop();

    expect(manager.getWinner()).toMatchObject({
      index: 1,
      pseudo: 'Adversaire 1',
    });
    expect(manager.getState().status).toBe('game-over');
  });

  it('réinitialise toutes les parties et le classement', () => {
    const manager = new GameManager({
      mode: 'versus-1',
      pseudo: 'Alice',
      rng: () => 0,
    });
    manager.start();
    manager.hardDrop();

    manager.restart();
    const state = manager.getState();

    expect(state).toMatchObject({
      status: 'ready',
      winner: null,
    });
    expect(state.players.every(player => (
      player.status === 'ready' &&
      player.score === 0 &&
      player.lines === 0 &&
      player.level === 1
    ))).toBe(true);
    expect(state.podium).toHaveLength(2);
  });
});
