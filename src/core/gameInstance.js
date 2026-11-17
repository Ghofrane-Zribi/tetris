import {
  clearCompletedLines,
  createGrid,
  isValidPosition,
  lockPiece,
  GRID_HEIGHT,
  GRID_WIDTH,
} from './grid.js';
import { PIECE_COLORS, PIECES, rotate } from './piece.js';
import { calculateScore, getDropInterval, getLevel } from './scoring.js';

const PIECE_TYPES = Object.keys(PIECES);

function cloneMatrix(matrix) {
  return matrix.map(row => [...row]);
}

function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

function createPiece(type) {
  const matrix = cloneMatrix(PIECES[type]);
  return {
    type,
    matrix,
    color: PIECE_COLORS[type],
    row: 0,
    column: Math.floor((GRID_WIDTH - matrix[0].length) / 2),
  };
}

function clonePiece(piece) {
  return {
    ...piece,
    matrix: cloneMatrix(piece.matrix),
  };
}

function validateRandomValue(value) {
  if (typeof value !== 'number' || value < 0 || value >= 1) {
    throw new Error('Le générateur aléatoire doit retourner une valeur entre 0 et 1.');
  }
}

function createRandomPiece(rng) {
  const randomValue = rng();
  validateRandomValue(randomValue);
  const type = PIECE_TYPES[Math.floor(randomValue * PIECE_TYPES.length)];
  return createPiece(type);
}

export class GameInstance {
  constructor({
    rng = Math.random,
    initialGrid = createGrid(),
    pseudo = 'Joueur',
  } = {}) {
    if (typeof rng !== 'function') {
      throw new Error('Le générateur aléatoire doit être une fonction.');
    }
    if (
      !Array.isArray(initialGrid) ||
      initialGrid.length !== GRID_HEIGHT ||
      initialGrid.some(row => !Array.isArray(row) || row.length !== GRID_WIDTH)
    ) {
      throw new Error('La grille initiale doit mesurer 10x20.');
    }
    if (typeof pseudo !== 'string' || pseudo.trim() === '') {
      throw new Error('Le pseudo doit être une chaîne non vide.');
    }

    this.rng = rng;
    this.initialGrid = cloneGrid(initialGrid);
    this.pseudo = pseudo.trim();
    this.state = this.createInitialState();
  }

  createInitialState() {
    return {
      pseudo: this.pseudo,
      grid: cloneGrid(this.initialGrid),
      current: createRandomPiece(this.rng),
      next: createRandomPiece(this.rng),
      status: 'ready',
      gameOver: false,
      score: 0,
      lines: 0,
      level: 1,
      dropInterval: getDropInterval(1),
      lastClearedRows: [],
      clearAnimationId: 0,
    };
  }

  getState() {
    return {
      ...this.state,
      grid: cloneGrid(this.state.grid),
      current: clonePiece(this.state.current),
      next: clonePiece(this.state.next),
    };
  }

  updateCurrent(changes) {
    const candidate = { ...this.state.current, ...changes };
    if (
      !isValidPosition(
        this.state.grid,
        candidate.matrix,
        candidate.row,
        candidate.column,
      )
    ) {
      return false;
    }

    this.state = { ...this.state, current: candidate };
    return true;
  }

  moveLeft() {
    return this.state.status === 'playing' &&
      this.updateCurrent({ column: this.state.current.column - 1 });
  }

  moveRight() {
    return this.state.status === 'playing' &&
      this.updateCurrent({ column: this.state.current.column + 1 });
  }

  rotate() {
    if (this.state.status !== 'playing') {
      return false;
    }

    return this.updateCurrent({ matrix: rotate(this.state.current.matrix) });
  }

  spawnNextPiece() {
    const current = this.state.next;
    const next = createRandomPiece(this.rng);
    if (!isValidPosition(this.state.grid, current.matrix, current.row, current.column)) {
      this.state = { ...this.state, current, next, status: 'game-over', gameOver: true };
      return false;
    }

    this.state = { ...this.state, current, next };
    return true;
  }

  lockCurrent() {
    const lockedGrid = lockPiece(
      this.state.grid,
      this.state.current.matrix,
      this.state.current.row,
      this.state.current.column,
      this.state.current.color,
    );
    const clearedRows = lockedGrid.reduce(
      (rows, row, index) => (row.every(cell => cell !== null) ? [...rows, index] : rows),
      [],
    );
    const { grid, clearedLines } = clearCompletedLines(lockedGrid);
    const lines = this.state.lines + clearedLines;
    const level = getLevel(lines);
    this.state = {
      ...this.state,
      grid,
      lines,
      level,
      score: this.state.score + calculateScore(clearedLines, this.state.level),
      dropInterval: getDropInterval(level),
      lastClearedRows: clearedRows,
      clearAnimationId: this.state.clearAnimationId + (clearedLines > 0 ? 1 : 0),
    };
    return this.spawnNextPiece();
  }

  drop() {
    if (this.state.status !== 'playing') {
      return false;
    }
    if (this.updateCurrent({ row: this.state.current.row + 1 })) {
      return true;
    }

    this.lockCurrent();
    return false;
  }

  hardDrop() {
    if (this.state.status !== 'playing') {
      return false;
    }

    while (this.updateCurrent({ row: this.state.current.row + 1 })) {
      // La pièce descend jusqu'à rencontrer la grille ou une autre pièce.
    }
    this.lockCurrent();
    return true;
  }

  start() {
    if (this.state.status === 'ready' || this.state.status === 'paused') {
      this.state = { ...this.state, status: 'playing' };
      return true;
    }
    return false;
  }

  pause() {
    if (this.state.status !== 'playing') {
      return false;
    }

    this.state = { ...this.state, status: 'paused' };
    return true;
  }

  restart() {
    this.state = this.createInitialState();
    return true;
  }
}
