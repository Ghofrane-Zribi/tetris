import { describe, expect, it } from 'vitest';
import { PIECE_COLORS, PIECES, rotate } from '../src/core/piece.js';
import { createGrid, isValidPosition, lockPiece } from '../src/core/grid.js';

describe('rotate', () => {
  it('fait pivoter une matrice 2x2 dans le sens horaire', () => {
    expect(rotate([
      [1, 2],
      [3, 4],
    ])).toEqual([
      [3, 1],
      [4, 2],
    ]);
  });

  it('fait pivoter une matrice 3x3 dans le sens horaire', () => {
    expect(rotate([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ])).toEqual([
      [7, 4, 1],
      [8, 5, 2],
      [9, 6, 3],
    ]);
  });

  it('lève une erreur pour une matrice non carrée', () => {
    expect(() => rotate([
      [1, 2, 3],
      [4, 5],
    ])).toThrow('La matrice doit être carrée.');
  });
});

describe('pièces', () => {
  it('définit une couleur pour chaque tétromino', () => {
    expect(Object.keys(PIECES)).toEqual(['I', 'O', 'T', 'S', 'Z', 'J', 'L']);
    expect(Object.keys(PIECE_COLORS)).toEqual(Object.keys(PIECES));
    expect(Object.values(PIECE_COLORS).every(color => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
  });
});
describe('mes tests', () => {
  it('T passe par ses quatre orientations et revient à sa forme de départ', () => {
    let matrix = PIECES.T;
    matrix = rotate(matrix);
    expect(matrix).toEqual([[0, 1, 0], [0, 1, 1], [0, 1, 0]]);
    matrix = rotate(rotate(rotate(matrix)));
    expect(matrix).toEqual(PIECES.T);
  });

  it('une pièce ne peut pas sortir par le bord gauche de la grille', () => {
    const grid = createGrid(4, 4);
    expect(isValidPosition(grid, PIECES.O, 0, -1)).toBe(false);
  });

  it('une pièce ne peut pas se poser sur une pièce déjà fixée', () => {
    const grid = lockPiece(createGrid(4, 4), PIECES.O, 2, 0, '#f0f000');
    expect(isValidPosition(grid, PIECES.O, 2, 0)).toBe(false);
    expect(isValidPosition(grid, PIECES.O, 0, 0)).toBe(true);
  });
});