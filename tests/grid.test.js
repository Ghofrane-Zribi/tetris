import { describe, expect, it } from 'vitest';
import {
  clearCompletedLines,
  createGrid,
  isValidPosition,
  lockPiece,
} from '../src/core/grid.js';
import { createGame } from '../src/core/game.js';

describe('grille', () => {
  it('rejette des dimensions de grille invalides', () => {
    expect(() => createGrid(0, 20)).toThrow(
      'Les dimensions de la grille doivent être des entiers positifs.',
    );
  });

  it('crée une grille de 20 lignes', () => {
    const grid = createGrid();

    expect(grid).toHaveLength(20);
  });

  it('crée des lignes de 10 colonnes', () => {
    const grid = createGrid();

    expect(grid.every(row => row.length === 10)).toBe(true);
  });

  it('crée une grille entièrement vide', () => {
    const grid = createGrid();

    expect(grid.every(row => row.every(cell => cell === null))).toBe(true);
  });

  it('accepte une pièce dans les limites', () => {
    const grid = createGrid(4, 4);
    const matrix = [
      [1, 1],
      [1, 1],
    ];

    expect(isValidPosition(grid, matrix, 0, 0)).toBe(true);
  });

  it('refuse une pièce au-delà de la limite basse', () => {
    expect(isValidPosition(createGrid(4, 4), [[1, 1], [1, 1]], 3, 0)).toBe(false);
  });

  it('refuse une pièce au-delà de la limite droite', () => {
    expect(isValidPosition(createGrid(4, 4), [[1, 1], [1, 1]], 0, 3)).toBe(false);
  });

  it('refuse une pièce au-delà de la limite gauche', () => {
    expect(isValidPosition(createGrid(4, 4), [[1]], 0, -1)).toBe(false);
  });

  it('détecte une collision avec une case occupée', () => {
    const grid = createGrid(4, 4);
    const occupiedGrid = lockPiece(grid, [[1]], 1, 1, '#f00');

    expect(isValidPosition(occupiedGrid, [[1]], 1, 1)).toBe(false);
  });

  it('fixe chaque case occupée avec la couleur donnée', () => {
    const grid = createGrid(4, 4);
    const updatedGrid = lockPiece(grid, [[1, 0], [1, 1]], 1, 1, '#00f');

    expect(updatedGrid[1]).toEqual([null, '#00f', null, null]);
    expect(updatedGrid[2]).toEqual([null, '#00f', '#00f', null]);
  });

  it('ne modifie pas la grille initiale lors de la pose', () => {
    const grid = createGrid(4, 4);

    lockPiece(grid, [[1, 0], [1, 1]], 1, 1, '#00f');

    expect(grid.every(row => row.every(cell => cell === null))).toBe(true);
  });

  it('refuse de poser une pièce sur une case occupée', () => {
    const grid = createGrid(4, 4);
    const occupiedGrid = lockPiece(grid, [[1]], 1, 1, '#f00');

    expect(() => lockPiece(occupiedGrid, [[1]], 1, 1, '#00f')).toThrow(
      'La pièce ne peut pas être fixée à cette position.',
    );
  });

  it('détecte et supprime une ligne complète', () => {
    const grid = [
      [null, null, null, null],
      ['#f00', '#f00', '#f00', '#f00'],
      ['#0f0', null, '#0f0', null],
    ];

    expect(clearCompletedLines(grid).clearedLines).toBe(1);
  });

  it('ajoute une ligne vide en haut après une suppression', () => {
    const grid = [
      [null, null, null, null],
      ['#f00', '#f00', '#f00', '#f00'],
      ['#0f0', null, '#0f0', null],
    ];

    expect(clearCompletedLines(grid).grid[0]).toEqual([null, null, null, null]);
  });

  it('conserve les lignes non complètes après suppression', () => {
    const grid = [
      [null, null, null, null],
      ['#f00', '#f00', '#f00', '#f00'],
      ['#0f0', null, '#0f0', null],
    ];

    expect(clearCompletedLines(grid).grid[2]).toEqual(['#0f0', null, '#0f0', null]);
  });

  it('déclenche le Game Over si la pièce suivante est bloquée', () => {
    const initialGrid = createGrid();
    initialGrid[0].splice(4, 2, '#ffffff', '#ffffff');
    let randomIndex = 0;
    const game = createGame({
      rng: () => [0.5, 0.2][randomIndex++ % 2],
      initialGrid,
    });

    game.start();
    game.hardDrop();

    expect(game.getState().status).toBe('game-over');
  });

  it('marque la partie comme terminée après un Game Over', () => {
    const initialGrid = createGrid();
    initialGrid[0].splice(4, 2, '#ffffff', '#ffffff');
    let randomIndex = 0;
    const game = createGame({
      rng: () => [0.5, 0.2][randomIndex++ % 2],
      initialGrid,
    });

    game.start();
    game.hardDrop();

    expect(game.getState().gameOver).toBe(true);
  });
});
