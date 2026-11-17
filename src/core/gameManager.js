import { createGrid } from './grid.js';
import { GameInstance } from './gameInstance.js';
import { AI_LEVELS, AIPlayer } from './ai.js';

const PLAYER_COUNTS = {
  solo: 1,
  'versus-1': 2,
  'versus-2': 3,
  'versus-3': 4,
};

function validateMode(mode) {
  if (!Object.hasOwn(PLAYER_COUNTS, mode)) {
    throw new Error('Le mode doit être solo ou opposer 1 à 3 adversaires.');
  }
}

function cloneInitialGrid(grid) {
  return grid.map(row => [...row]);
}

/**
 * Coordonne les parties humaine et IA d’un mode de jeu.
 * @class
 * @throws {Error} Si le mode, les générateurs ou les joueurs sont invalides.
 */
export class GameManager {
  /**
   * Initialise les instances d’un mode de jeu.
   * @param {Object} [options] Options du manager.
   * @param {string} [options.mode='solo'] Mode de jeu.
   * @param {string} [options.pseudo='Joueur'] Pseudo du joueur humain.
   * @param {Array<string>} [options.pseudos] Pseudos de tous les joueurs.
   * @param {Function} [options.rng=Math.random] Générateur des pièces.
   * @param {Function} [options.aiRng=Math.random] Générateur aléatoire des IA.
   * @param {Array<string>} [options.aiLevels] Niveaux des adversaires IA.
   * @param {Array<Array<Array<*>>>} [options.initialGrids] Grilles initiales.
   * @returns {GameManager} Manager initialisé.
   * @throws {Error} Si une option ou un joueur est invalide.
   */
  constructor({
    mode = 'solo',
    pseudo = 'Joueur',
    pseudos,
    rng = Math.random,
    aiRng = Math.random,
    aiLevels,
    initialGrids,
  } = {}) {
    validateMode(mode);
    if (typeof rng !== 'function') {
      throw new Error('Le générateur aléatoire doit être une fonction.');
    }
    if (typeof aiRng !== 'function') {
      throw new Error('Le générateur aléatoire de l’IA doit être une fonction.');
    }

    const playerCount = PLAYER_COUNTS[mode];
    const names = pseudos ?? [
      pseudo,
      ...Array.from({ length: playerCount - 1 }, (_, index) => `Adversaire ${index + 1}`),
    ];
    if (
      !Array.isArray(names) ||
      names.length !== playerCount ||
      names.some(name => typeof name !== 'string' || name.trim() === '')
    ) {
      throw new Error('Le nombre de pseudos doit correspondre au nombre de joueurs.');
    }
    if (initialGrids !== undefined && (
      !Array.isArray(initialGrids) ||
      initialGrids.length !== playerCount
    )) {
      throw new Error('Le nombre de grilles initiales doit correspondre au nombre de joueurs.');
    }

    this.mode = mode;
    this.humanIndex = 0;
    this.rng = rng;
    this.aiRng = aiRng;
    this.initialGrids = initialGrids?.map(cloneInitialGrid);
    this.instances = names.map((name, index) => new GameInstance({
      pseudo: name,
      rng,
      initialGrid: this.initialGrids?.[index] ?? createGrid(),
    }));
    this.aiPlayers = names.slice(1).map((_, index) => {
      const level = aiLevels?.[index] ?? ['beginner', 'intermediate', 'expert'][index] ?? 'expert';
      return new AIPlayer({ level, rng: aiRng });
    });
    this.aiPlans = Array(this.instances.length).fill(null);
    this.aiElapsed = Array(this.instances.length).fill(0);
    this.status = 'ready';
    this.eliminationOrder = [];
  }

  /**
   * Retourne une instance de joueur par son index.
   * @param {number} index Index du joueur.
   * @returns {GameInstance} Instance correspondante.
   * @throws {Error} Si l’index est invalide.
   */
  getInstance(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.instances.length) {
      throw new Error('L’index du joueur est invalide.');
    }

    return this.instances[index];
  }

  /**
   * Retourne une copie de la liste des instances.
   * @returns {Array<GameInstance>} Instances des joueurs.
   * @throws {Error} Si la liste interne est invalide.
   */
  getInstances() {
    return [...this.instances];
  }

  /**
   * Met à jour les éliminations et l’état de fin de partie.
   * @returns {void} Ne retourne aucune valeur.
   * @throws {Error} Si une instance de joueur est invalide.
   */
  refreshResults() {
    this.instances.forEach((instance, index) => {
      if (instance.getState().gameOver && !this.eliminationOrder.includes(index)) {
        this.eliminationOrder.push(index);
      }
    });
    const humanState = this.getInstance(this.humanIndex).getState();
    const aliveCount = this.instances.filter(instance => !instance.getState().gameOver).length;
    if (
      (this.instances.length === 1 && humanState.gameOver) ||
      (this.eliminationOrder.length > 0 && aliveCount <= 1)
    ) {
      this.status = 'game-over';
    }
  }

  /**
   * Détermine le dernier joueur encore en vie.
   * @returns {Object|null} Joueur gagnant, ou null si le résultat est indéterminé.
   * @throws {Error} Si l’état d’une partie est invalide.
   */
  getWinner() {
    this.refreshResults();
    const aliveIndexes = this.instances
      .map((instance, index) => ({ index, state: instance.getState() }))
      .filter(({ state }) => !state.gameOver)
      .map(({ index }) => index);

    if (aliveIndexes.length !== 1 || this.instances.length === 1) {
      return null;
    }

    return this.getPlayerSnapshot(aliveIndexes[0]);
  }

  /**
   * Construit l’état public d’un joueur.
   * @param {number} index Index du joueur.
   * @returns {Object} État du joueur avec ses métadonnées.
   * @throws {Error} Si l’index est invalide.
   */
  getPlayerSnapshot(index) {
    const state = this.getInstance(index).getState();
    const ai = index > this.humanIndex ? this.aiPlayers[index - 1] : null;
    return {
      ...state,
      index,
      isHuman: index === this.humanIndex,
      alive: !state.gameOver,
      isAi: Boolean(ai),
      aiLevel: ai?.level ?? null,
      aiLevelLabel: ai ? AI_LEVELS[ai.level].label : null,
      aiDelay: ai ? AI_LEVELS[ai.level].delay : null,
    };
  }

  /**
   * Exécute une action élémentaire pour un joueur IA.
   * @param {number} index Index du joueur IA.
   * @returns {boolean} Vrai si une action a été exécutée.
   * @throws {Error} Si l’index ou la décision IA est invalide.
   */
  playAiStep(index) {
    const ai = this.aiPlayers[index - 1];
    const instance = this.getInstance(index);
    const state = instance.getState();
    if (!ai || state.gameOver || state.status !== 'playing') {
      return false;
    }

    let plan = this.aiPlans[index];
    if (!plan || plan.pieceType !== state.current.type) {
      const decision = ai.decide(state.grid, state.current, state.next);
      plan = {
        pieceType: state.current.type,
        rotation: decision.rotation,
        column: decision.column,
      };
      this.aiPlans[index] = plan;
    }

    if (plan.rotation > 0) {
      if (!instance.rotate()) {
        plan.rotation = 0;
      } else {
        plan.rotation--;
      }
      return true;
    }

    if (state.current.column < plan.column) {
      if (instance.moveRight()) {
        return true;
      }
    }
    if (state.current.column > plan.column) {
      if (instance.moveLeft()) {
        return true;
      }
    }

    const dropped = instance.drop();
    if (!dropped) {
      this.aiPlans[index] = null;
    }
    return true;
  }

  /**
   * Avance les joueurs IA selon le temps écoulé.
   * @param {number} deltaTime Temps écoulé en millisecondes.
   * @returns {boolean} Vrai si au moins une IA a joué.
   * @throws {Error} Si le temps écoulé est invalide.
   */
  tick(deltaTime) {
    if (this.status !== 'playing') {
      return false;
    }
    if (!Number.isFinite(deltaTime) || deltaTime < 0) {
      throw new Error('Le temps écoulé doit être un nombre positif ou nul.');
    }

    let changed = false;
    this.aiPlayers.forEach((ai, offset) => {
      const index = offset + 1;
      this.aiElapsed[index] += deltaTime;
      if (this.aiElapsed[index] < AI_LEVELS[ai.level].delay) {
        return;
      }
      this.aiElapsed[index] = 0;
      changed = this.playAiStep(index) || changed;
    });
    this.refreshResults();
    return changed;
  }

  /**
   * Retourne le classement courant ou final.
   * @returns {Array<Object>} Joueurs classés par position.
   * @throws {Error} Si l’état d’une partie est invalide.
   */
  getPodium() {
    this.refreshResults();
    const eliminated = [...this.eliminationOrder].reverse();
    const remaining = this.instances
      .map((_, index) => index)
      .filter(index => !this.eliminationOrder.includes(index));

    return [...remaining, ...eliminated].map((index, position) => ({
      position: position + 1,
      ...this.getPlayerSnapshot(index),
    }));
  }

  /**
   * Retourne l’état public complet du manager.
   * @returns {Object} État du mode, des joueurs et du classement.
   * @throws {Error} Si l’état d’une partie est invalide.
   */
  getState() {
    this.refreshResults();
    return {
      mode: this.mode,
      status: this.status,
      humanIndex: this.humanIndex,
      winner: this.getWinner(),
      players: this.instances.map((_, index) => this.getPlayerSnapshot(index)),
      podium: this.getPodium(),
    };
  }

  /**
   * Démarre toutes les parties du manager.
   * @returns {boolean} Vrai si les parties sont démarrées.
   * @throws {Error} Si une partie ne peut pas être démarrée.
   */
  start() {
    if (this.status === 'game-over') {
      return false;
    }

    const started = this.instances
      .filter(instance => !instance.getState().gameOver)
      .every(instance => instance.start());
    if (started) {
      this.status = 'playing';
    }
    return started;
  }

  /**
   * Met en pause les parties en cours.
   * @returns {boolean} Vrai si les parties sont mises en pause.
   * @throws {Error} Si une partie ne peut pas être mise en pause.
   */
  pause() {
    const paused = this.instances
      .filter(instance => instance.getState().status === 'playing')
      .every(instance => instance.pause());
    if (paused) {
      this.status = 'paused';
    }
    return paused;
  }

  /**
   * Réinitialise toutes les parties et le classement.
   * @returns {boolean} Toujours vrai après réinitialisation.
   * @throws {Error} Si une partie ne peut pas être réinitialisée.
   */
  restart() {
    this.instances.forEach(instance => instance.restart());
    this.status = 'ready';
    this.eliminationOrder = [];
    this.aiPlans.fill(null);
    this.aiElapsed.fill(0);
    return true;
  }

  /**
   * Déplace le joueur humain vers la gauche.
   * @returns {boolean} Vrai si le déplacement est effectué.
   * @throws {Error} Si l’instance humaine est invalide.
   */
  moveLeft() {
    return this.getInstance(this.humanIndex).moveLeft();
  }

  /**
   * Déplace le joueur humain vers la droite.
   * @returns {boolean} Vrai si le déplacement est effectué.
   * @throws {Error} Si l’instance humaine est invalide.
   */
  moveRight() {
    return this.getInstance(this.humanIndex).moveRight();
  }

  /**
   * Fait tourner la pièce du joueur humain.
   * @returns {boolean} Vrai si la rotation est effectuée.
   * @throws {Error} Si l’instance humaine est invalide.
   */
  rotate() {
    return this.getInstance(this.humanIndex).rotate();
  }

  /**
   * Fait descendre la pièce du joueur humain d’une ligne.
   * @returns {boolean} Vrai si la pièce descend.
   * @throws {Error} Si l’instance humaine est invalide.
   */
  drop() {
    return this.getInstance(this.humanIndex).drop();
  }

  /**
   * Fait chuter directement la pièce du joueur humain.
   * @returns {boolean} Vrai si la chute est traitée.
   * @throws {Error} Si l’instance humaine est invalide.
   */
  hardDrop() {
    return this.getInstance(this.humanIndex).hardDrop();
  }
}
