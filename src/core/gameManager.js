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

export class GameManager {
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

  getInstance(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.instances.length) {
      throw new Error('L’index du joueur est invalide.');
    }

    return this.instances[index];
  }

  getInstances() {
    return [...this.instances];
  }

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
      return instance.moveRight();
    }
    if (state.current.column > plan.column) {
      return instance.moveLeft();
    }

    const dropped = instance.drop();
    if (!dropped) {
      this.aiPlans[index] = null;
    }
    return true;
  }

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

  start() {
    if (this.status === 'game-over') {
      return false;
    }

    const started = this.instances.every(instance => instance.start());
    if (started) {
      this.status = 'playing';
    }
    return started;
  }

  pause() {
    const paused = this.instances
      .filter(instance => instance.getState().status === 'playing')
      .every(instance => instance.pause());
    if (paused) {
      this.status = 'paused';
    }
    return paused;
  }

  restart() {
    this.instances.forEach(instance => instance.restart());
    this.status = 'ready';
    this.eliminationOrder = [];
    this.aiPlans.fill(null);
    this.aiElapsed.fill(0);
    return true;
  }

  moveLeft() {
    return this.getInstance(this.humanIndex).moveLeft();
  }

  moveRight() {
    return this.getInstance(this.humanIndex).moveRight();
  }

  rotate() {
    return this.getInstance(this.humanIndex).rotate();
  }

  drop() {
    return this.getInstance(this.humanIndex).drop();
  }

  hardDrop() {
    return this.getInstance(this.humanIndex).hardDrop();
  }
}
