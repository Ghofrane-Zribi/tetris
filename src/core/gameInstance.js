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

/**
 * Représente une partie individuelle et son état courant.
 * @class
 * @throws {Error} Si les options de construction sont invalides.
 */
export class GameInstance {
  /**
   * Initialise une partie.
   * @param {Object} [options] Options de la partie.
   * @param {Function} [options.rng=Math.random] Générateur aléatoire des pièces.
   * @param {Array<Array<*>>} [options.initialGrid] Grille initiale de 10x20.
   * @param {string} [options.pseudo='Joueur'] Pseudo du joueur.
   * @returns {GameInstance} Partie initialisée.
   * @throws {Error} Si le générateur, la grille ou le pseudo est invalide.
   */
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

  /**
   * Construit l’état initial de la partie.
   * @returns {Object} État initial avec grille et pièces.
   * @throws {Error} Si le générateur aléatoire produit une valeur invalide.
   */
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

  /**
   * Retourne une copie isolée de l’état courant.
   * @returns {Object} État de la partie.
   * @throws {Error} Si une copie de l’état ne peut pas être produite.
   */
  getState() {
    return {
      ...this.state,
      grid: cloneGrid(this.state.grid),
      current: clonePiece(this.state.current),
      next: clonePiece(this.state.next),
    };
  }

  /**
   * Met à jour la pièce courante si sa nouvelle position est valide.
   * @param {Object} changes Propriétés de pièce à modifier.
   * @returns {boolean} Vrai si la mise à jour est appliquée.
   * @throws {TypeError} Si les changements ne permettent pas de vérifier la position.
   */
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

  /**
   * Déplace la pièce courante vers la gauche.
   * @returns {boolean} Vrai si le déplacement est effectué.
   * @throws {TypeError} Si l’état courant est invalide.
   */
  moveLeft() {
    return this.state.status === 'playing' &&
      this.updateCurrent({ column: this.state.current.column - 1 });
  }

  /**
   * Déplace la pièce courante vers la droite.
   * @returns {boolean} Vrai si le déplacement est effectué.
   * @throws {TypeError} Si l’état courant est invalide.
   */
  moveRight() {
    return this.state.status === 'playing' &&
      this.updateCurrent({ column: this.state.current.column + 1 });
  }

  /**
   * Fait tourner la pièce courante dans le sens horaire.
   * @returns {boolean} Vrai si la rotation est effectuée.
   * @throws {Error} Si la rotation de la matrice est impossible.
   */
  rotate() {
    if (this.state.status !== 'playing') {
      return false;
    }

    return this.updateCurrent({ matrix: rotate(this.state.current.matrix) });
  }

  /**
   * Fait apparaître la pièce suivante ; passe la partie en Game Over si elle ne peut pas apparaître.
   * @returns {boolean} Vrai si la pièce suivante a pu apparaître, faux en cas de Game Over.
   * @throws {Error} Si le générateur aléatoire produit une valeur invalide.
   */
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

  /**
   * Fixe la pièce courante, met à jour le score et les lignes.
   * @returns {boolean} Vrai si la prochaine pièce peut apparaître.
   * @throws {Error} Si la pièce courante ne peut pas être fixée.
   */
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

  /**
   * Fait descendre la pièce d’une ligne ou la fixe.
   * @returns {boolean} Vrai si la pièce descend, faux si elle est fixée.
   * @throws {Error} Si la pièce courante ne peut pas être fixée.
   */
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

  /**
   * Fait descendre directement la pièce jusqu’au point de fixation.
   * @returns {boolean} Vrai si la chute directe est traitée.
   * @throws {Error} Si la pièce courante ne peut pas être fixée.
   */
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

  /**
   * Démarre ou reprend la partie.
   * @returns {boolean} Vrai si la partie passe à l’état « playing ».
   * @throws {Error} Si l’état courant est invalide.
   */
  start() {
    if (this.state.status === 'ready' || this.state.status === 'paused') {
      this.state = { ...this.state, status: 'playing' };
      return true;
    }
    return false;
  }

  /**
   * Met la partie en pause.
   * @returns {boolean} Vrai si la partie est mise en pause.
   * @throws {Error} Si l’état courant est invalide.
   */
  pause() {
    if (this.state.status !== 'playing') {
      return false;
    }

    this.state = { ...this.state, status: 'paused' };
    return true;
  }

  /**
   * Réinitialise la partie avec sa configuration initiale.
   * @returns {boolean} Toujours vrai après réinitialisation.
   * @throws {Error} Si le générateur aléatoire produit une valeur invalide.
   */
  restart() {
    this.state = this.createInitialState();
    return true;
  }
}
