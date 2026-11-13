import { describe, expect, it } from 'vitest';
import {
  clearCompletedLines,
  createGrid,
  isValidPosition,
  lockPiece,
} from '../src/core/grid.js';

describe('grille', () => {
  it('crée une grille 10x20 vide', () => {
    const grid = createGrid();

    expect(grid).toHaveLength(20);
    expect(grid.every(row => row.length === 10 && row.every(cell => cell === null))).toBe(true);
  });

  it('détecte les limites et les collisions', () => {
    const grid = createGrid(4, 4);
    const matrix = [
      [1, 1],
      [1, 1],
    ];

    expect(isValidPosition(grid, matrix, 0, 0)).toBe(true);
    expect(isValidPosition(grid, matrix, 3, 0)).toBe(false);
    expect(isValidPosition(grid, matrix, 0, 3)).toBe(false);

    const occupiedGrid = lockPiece(grid, [[1]], 1, 1, '#f00');
    expect(isValidPosition(occupiedGrid, [[1]], 1, 1)).toBe(false);
  });

  it('fixe une pièce avec sa couleur sans modifier la grille initiale', () => {
    const grid = createGrid(4, 4);
    const updatedGrid = lockPiece(grid, [[1, 0], [1, 1]], 1, 1, '#00f');

    expect(updatedGrid[1]).toEqual([null, '#00f', null, null]);
    expect(updatedGrid[2]).toEqual([null, '#00f', '#00f', null]);
    expect(grid.every(row => row.every(cell => cell === null))).toBe(true);
  });

  it('supprime les lignes complètes et ajoute des lignes vides en haut', () => {
    const grid = [
      [null, null, null, null],
      ['#f00', '#f00', '#f00', '#f00'],
      ['#0f0', null, '#0f0', null],
    ];

    expect(clearCompletedLines(grid)).toEqual({
      grid: [
        [null, null, null, null],
        [null, null, null, null],
        ['#0f0', null, '#0f0', null],
      ],
      clearedLines: 1,
    });
  });
});
