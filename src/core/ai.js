import {
  clearCompletedLines,
  isValidPosition,
  lockPiece,
  GRID_WIDTH,
} from './grid.js';
import { rotate } from './piece.js';

export const AI_LEVELS = {
  beginner: {
    label: 'Débutant',
    delay: 300,
  },
  intermediate: {
    label: 'Intermédiaire',
    delay: 200,
  },
  expert: {
    label: 'Expert',
    delay: 100,
  },
};

export const EXPERT_WEIGHTS = {
  height: -0.51,
  lines: 0.76,
  holes: -0.36,
  bumpiness: -0.18,
};

function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

function matrixKey(matrix) {
  return JSON.stringify(matrix);
}

function getRotations(piece) {
  const rotations = [];
  let matrix = piece.matrix.map(row => [...row]);
  const seen = new Set();
  for (let rotationCount = 0; rotationCount < 4; rotationCount++) {
    const key = matrixKey(matrix);
    if (!seen.has(key)) {
      rotations.push({ matrix, rotation: rotationCount });
      seen.add(key);
    }
    matrix = rotate(matrix);
  }
  return rotations;
}

function getDropRow(grid, matrix, column) {
  if (!isValidPosition(grid, matrix, 0, column)) {
    return null;
  }

  let row = 0;
  while (isValidPosition(grid, matrix, row + 1, column)) {
    row++;
  }
  return row;
}

function getBoardMetrics(grid) {
  const heights = grid[0].map((_, column) => {
    const firstOccupied = grid.findIndex(row => row[column] !== null);
    return firstOccupied === -1 ? 0 : grid.length - firstOccupied;
  });
  const holes = heights.reduce((total, height, column) => {
    const firstOccupied = grid.length - height;
    return total + grid
      .slice(firstOccupied)
      .filter(row => row[column] === null)
      .length;
  }, 0);
  const aggregateHeight = heights.reduce((total, height) => total + height, 0);
  const bumpiness = heights
    .slice(1)
    .reduce((total, height, index) => total + Math.abs(height - heights[index]), 0);
  const averageHeight = aggregateHeight / heights.length;

  return { aggregateHeight, averageHeight, holes, bumpiness };
}

function simulatePlacement(grid, piece, matrix, column) {
  const row = getDropRow(grid, matrix, column);
  if (row === null) {
    return null;
  }

  const lockedGrid = lockPiece(grid, matrix, row, column, piece.color);
  const { grid: clearedGrid, clearedLines } = clearCompletedLines(lockedGrid);
  return { grid: clearedGrid, clearedLines };
}

function getCandidates(grid, piece) {
  return getRotations(piece).flatMap(({ matrix, rotation }) => {
    const maxColumn = GRID_WIDTH - matrix[0].length;
    return Array.from({ length: maxColumn + 1 }, (_, column) => {
      const placement = simulatePlacement(grid, piece, matrix, column);
      return placement ? { rotation, column, ...placement } : null;
    }).filter(Boolean);
  });
}

function scoreIntermediate(candidate) {
  const metrics = getBoardMetrics(candidate.grid);
  return (
    -metrics.averageHeight -
    1.5 * metrics.holes +
    2 * candidate.clearedLines -
    0.3 * metrics.bumpiness
  );
}

function scoreExpert(candidate) {
  const metrics = getBoardMetrics(candidate.grid);
  return (
    EXPERT_WEIGHTS.height * metrics.aggregateHeight +
    EXPERT_WEIGHTS.lines * candidate.clearedLines +
    EXPERT_WEIGHTS.holes * metrics.holes +
    EXPERT_WEIGHTS.bumpiness * metrics.bumpiness
  );
}

function chooseBest(candidates, score) {
  return candidates.reduce((best, candidate) => (
    score(candidate) > score(best) ? candidate : best
  ));
}

function bestNextScore(grid, piece) {
  const candidates = getCandidates(grid, piece);
  return candidates.length === 0 ? 0 : scoreExpert(chooseBest(candidates, scoreExpert));
}

function scoreExpertWithNext(candidate, next) {
  return scoreExpert(candidate) + (next ? 0.1 * bestNextScore(candidate.grid, next) : 0);
}

export class AIPlayer {
  constructor({ level = 'beginner', rng = Math.random } = {}) {
    if (!Object.hasOwn(AI_LEVELS, level)) {
      throw new Error('Le niveau IA doit être débutant, intermédiaire ou expert.');
    }
    if (typeof rng !== 'function') {
      throw new Error('Le générateur aléatoire de l’IA doit être une fonction.');
    }

    this.level = level;
    this.rng = rng;
  }

  decide(grid, piece, next) {
    const candidates = getCandidates(grid, piece);
    if (candidates.length === 0) {
      return {
        rotation: 0,
        column: piece.column,
      };
    }

    if (this.level === 'beginner') {
      const randomValue = this.rng();
      if (typeof randomValue !== 'number' || randomValue < 0 || randomValue >= 1) {
        throw new Error('Le générateur aléatoire de l’IA doit retourner une valeur entre 0 et 1.');
      }
      const candidate = candidates[Math.floor(randomValue * candidates.length)];
      return { rotation: candidate.rotation, column: candidate.column };
    }

    const candidate = this.level === 'intermediate'
      ? chooseBest(candidates, scoreIntermediate)
      : chooseBest(candidates, item => scoreExpertWithNext(item, next));
    return { rotation: candidate.rotation, column: candidate.column };
  }
}
