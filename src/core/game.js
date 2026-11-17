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

export function createGame({
  rng = Math.random,
  initialGrid = createGrid(),
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

  function createInitialState() {
    return {
      grid: cloneGrid(initialGrid),
      current: createRandomPiece(rng),
      next: createRandomPiece(rng),
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

  let state = createInitialState();

  function getState() {
    return {
      ...state,
      grid: cloneGrid(state.grid),
      current: clonePiece(state.current),
      next: clonePiece(state.next),
    };
  }

  function updateCurrent(changes) {
    const candidate = { ...state.current, ...changes };
    if (!isValidPosition(state.grid, candidate.matrix, candidate.row, candidate.column)) {
      return false;
    }

    state = { ...state, current: candidate };
    return true;
  }

  function moveLeft() {
    return state.status === 'playing' && updateCurrent({ column: state.current.column - 1 });
  }

  function moveRight() {
    return state.status === 'playing' && updateCurrent({ column: state.current.column + 1 });
  }

  function rotateCurrent() {
    if (state.status !== 'playing') {
      return false;
    }

    return updateCurrent({ matrix: rotate(state.current.matrix) });
  }

  function spawnNextPiece() {
    const current = state.next;
    const next = createRandomPiece(rng);
    if (!isValidPosition(state.grid, current.matrix, current.row, current.column)) {
      state = { ...state, current, next, status: 'game-over', gameOver: true };
      return false;
    }

    state = { ...state, current, next };
    return true;
  }

  function lockCurrent() {
    const lockedGrid = lockPiece(
      state.grid,
      state.current.matrix,
      state.current.row,
      state.current.column,
      state.current.color,
    );
    const clearedRows = lockedGrid.reduce(
      (rows, row, index) => (row.every(cell => cell !== null) ? [...rows, index] : rows),
      [],
    );
    const { grid, clearedLines } = clearCompletedLines(lockedGrid);
    const lines = state.lines + clearedLines;
    const level = getLevel(lines);
    state = {
      ...state,
      grid,
      lines,
      level,
      score: state.score + calculateScore(clearedLines, state.level),
      dropInterval: getDropInterval(level),
      lastClearedRows: clearedRows,
      clearAnimationId: state.clearAnimationId + (clearedLines > 0 ? 1 : 0),
    };
    return spawnNextPiece();
  }

  function drop() {
    if (state.status !== 'playing') {
      return false;
    }
    if (updateCurrent({ row: state.current.row + 1 })) {
      return true;
    }

    lockCurrent();
    return false;
  }

  function hardDrop() {
    if (state.status !== 'playing') {
      return false;
    }

    while (updateCurrent({ row: state.current.row + 1 })) {
      // La pièce descend jusqu'à rencontrer la grille ou une autre pièce.
    }
    lockCurrent();
    return true;
  }

  function start() {
    if (state.status === 'ready' || state.status === 'paused') {
      state = { ...state, status: 'playing' };
      return true;
    }
    return false;
  }

  function pause() {
    if (state.status !== 'playing') {
      return false;
    }

    state = { ...state, status: 'paused' };
    return true;
  }

  function restart() {
    state = createInitialState();
    return true;
  }

  return {
    getState,
    moveLeft,
    moveRight,
    rotate: rotateCurrent,
    drop,
    hardDrop,
    start,
    pause,
    restart,
  };
}
