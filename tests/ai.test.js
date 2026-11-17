import { describe, expect, it } from 'vitest';
import { AI_LEVELS, AIPlayer } from '../src/core/ai.js';
import {
  clearCompletedLines,
  createGrid,
  isValidPosition,
  lockPiece,
} from '../src/core/grid.js';
import { PIECE_COLORS, PIECES, rotate } from '../src/core/piece.js';
import { GameInstance } from '../src/core/gameInstance.js';

function createPiece(type = 'T') {
  return {
    type,
    matrix: PIECES[type].map(row => [...row]),
    color: PIECE_COLORS[type],
    row: 0,
    column: 3,
  };
}

function createGridFromHeights(heights) {
  const grid = createGrid();
  heights.forEach((height, column) => {
    for (let row = 20 - height; row < 20; row++) {
      grid[row][column] = '#ffffff';
    }
  });
  return grid;
}

function simulateDecision(grid, piece, decision) {
  let matrix = piece.matrix.map(row => [...row]);
  for (let rotation = 0; rotation < decision.rotation; rotation++) {
    matrix = rotate(matrix);
  }

  let row = 0;
  while (isValidPosition(grid, matrix, row + 1, decision.column)) {
    row++;
  }
  const lockedGrid = lockPiece(grid, matrix, row, decision.column, piece.color);
  return clearCompletedLines(lockedGrid).grid;
}

function getMetrics(grid) {
  const heights = grid[0].map((_, column) => {
    const firstOccupied = grid.findIndex(row => row[column] !== null);
    return firstOccupied === -1 ? 0 : grid.length - firstOccupied;
  });
  const aggregateHeight = heights.reduce((total, height) => total + height, 0);
  const holes = heights.reduce((total, height, column) => (
    total + grid
      .slice(grid.length - height)
      .filter(row => row[column] === null)
      .length
  ), 0);
  const bumpiness = heights
    .slice(1)
    .reduce((total, height, index) => total + Math.abs(height - heights[index]), 0);
  return { aggregateHeight, holes, bumpiness };
}

describe('AIPlayer', () => {
  it('choisit un placement valide aléatoire au niveau débutant', () => {
    const ai = new AIPlayer({ level: 'beginner', rng: () => 0 });

    expect(ai.decide(createGrid(), createPiece(), null)).toEqual({
      rotation: 0,
      column: 0,
    });
  });

  it('évalue les placements intermédiaires sans modifier la grille', () => {
    const grid = createGrid();
    grid[19][0] = '#ffffff';
    const before = grid.map(row => [...row]);
    const ai = new AIPlayer({ level: 'intermediate' });

    const decision = ai.decide(grid, createPiece(), null);

    expect(decision.rotation).toBeGreaterThanOrEqual(0);
    expect(decision.rotation).toBeLessThan(4);
    expect(decision.column).toBeGreaterThanOrEqual(0);
    expect(grid).toEqual(before);
  });

  it('évite les trous sur une grille construite avec un trou', () => {
    const grid = createGrid();
    grid[19].fill('#ffffff');
    grid[18][4] = null;
    const piece = createPiece();
    const ai = new AIPlayer({ level: 'intermediate' });

    const decision = ai.decide(grid, piece, null);
    const metrics = getMetrics(simulateDecision(grid, piece, decision));

    expect(metrics.holes).toBe(0);
  });

  it('réduit l’irrégularité sur une grille construite en dents de scie', () => {
    const grid = createGridFromHeights([1, 4, 1, 4, 1, 4, 1, 4, 1, 4]);
    const piece = createPiece();
    const ai = new AIPlayer({ level: 'expert' });

    const decision = ai.decide(grid, piece, null);
    const chosenMetrics = getMetrics(simulateDecision(grid, piece, decision));
    const alternativeMetrics = getMetrics(simulateDecision(grid, piece, {
      rotation: 0,
      column: 1,
    }));

    expect(chosenMetrics.bumpiness).toBeLessThan(alternativeMetrics.bumpiness);
  });

  it('privilégie une position qui limite la hauteur totale', () => {
    const grid = createGridFromHeights([15, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const piece = createPiece();
    const ai = new AIPlayer({ level: 'intermediate' });

    const decision = ai.decide(grid, piece, null);
    const chosenMetrics = getMetrics(simulateDecision(grid, piece, decision));
    const alternativeMetrics = getMetrics(simulateDecision(grid, piece, {
      rotation: 0,
      column: 0,
    }));

    expect(chosenMetrics.aggregateHeight).toBeLessThan(alternativeMetrics.aggregateHeight);
  });

  it('choisit la meilleure position dans un emplacement évident', () => {
    const grid = createGrid();
    grid[19].forEach((_, column) => {
      if (column !== 4 && column !== 5) {
        grid[19][column] = '#ffffff';
      }
    });
    const ai = new AIPlayer({ level: 'intermediate' });

    expect(ai.decide(grid, createPiece('O'), createPiece('T'))).toEqual({
      rotation: 0,
      column: 4,
    });
  });

  it('utilise la pièce suivante au niveau expert', () => {
    const ai = new AIPlayer({ level: 'expert' });

    const decision = ai.decide(createGrid(), createPiece('I'), createPiece('O'));

    expect(decision).toMatchObject({
      rotation: expect.any(Number),
      column: expect.any(Number),
    });
  });

  it('ne triche pas : chaque décision est jouable par GameInstance', () => {
    ['beginner', 'intermediate', 'expert'].forEach(level => {
      const game = new GameInstance({ rng: () => 0.3 });
      game.start();
      const state = game.getState();
      const decision = new AIPlayer({ level, rng: () => 0 }).decide(
        state.grid,
        state.current,
        state.next,
      );

      for (let rotation = 0; rotation < decision.rotation; rotation++) {
        expect(game.rotate()).toBe(true);
      }
      while (game.getState().current.column < decision.column) {
        expect(game.moveRight()).toBe(true);
      }
      while (game.getState().current.column > decision.column) {
        expect(game.moveLeft()).toBe(true);
      }
      expect(game.hardDrop()).toBe(true);
    });
  });

  it('expose un délai propre à chaque niveau', () => {
    expect(AI_LEVELS.beginner.delay).toBe(300);
    expect(AI_LEVELS.intermediate.delay).toBe(200);
    expect(AI_LEVELS.expert.delay).toBe(100);
  });

  it('refuse un niveau inconnu', () => {
    expect(() => new AIPlayer({ level: 'impossible' })).toThrow();
  });
});
