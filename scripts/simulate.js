import { AIPlayer, EXPERT_WEIGHTS } from '../src/core/ai.js';
import { GameInstance } from '../src/core/gameInstance.js';

const GAME_COUNT = 20;
const MAX_TURNS = 2000;
const SEED = 0x5eed1234;
const ORIGINAL_EXPERT_WEIGHTS = { ...EXPERT_WEIGHTS };
const WEIGHT_LABELS = {
  height: 'hauteur',
  lines: 'lignes',
  holes: 'trous',
  bumpiness: 'irrégularité',
};

function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function playDecision(game, decision) {
  for (let rotation = 0; rotation < decision.rotation; rotation++) {
    if (!game.rotate()) {
      return false;
    }
  }

  while (game.getState().current.column < decision.column) {
    if (!game.moveRight()) {
      return false;
    }
  }
  while (game.getState().current.column > decision.column) {
    if (!game.moveLeft()) {
      return false;
    }
  }

  return game.hardDrop();
}

function playGame(level, gameSeed) {
  const game = new GameInstance({
    rng: createRng(gameSeed),
  });
  const ai = new AIPlayer({
    level,
    rng: createRng(gameSeed ^ 0xa5a5a5a5),
  });
  game.start();

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const state = game.getState();
    if (state.gameOver) {
      return state.lines;
    }

    const decision = ai.decide(state.grid, state.current, state.next);
    if (!playDecision(game, decision)) {
      return game.getState().lines;
    }
  }

  throw new Error(`La simulation ${level} dépasse ${MAX_TURNS} tours.`);
}

function simulateLevel(level) {
  let totalLines = 0;
  for (let gameIndex = 0; gameIndex < GAME_COUNT; gameIndex++) {
    const gameSeed = SEED + gameIndex;
    totalLines += playGame(level, gameSeed);
  }
  return totalLines / GAME_COUNT;
}

console.log(`Simulation experte de ${GAME_COUNT} parties par cas (graine fixe : ${SEED})`);
console.log(
  `Valeurs d'origine : hauteur ${ORIGINAL_EXPERT_WEIGHTS.height}, ` +
  `lignes ${ORIGINAL_EXPERT_WEIGHTS.lines}, trous ${ORIGINAL_EXPERT_WEIGHTS.holes}, ` +
  `irrégularité ${ORIGINAL_EXPERT_WEIGHTS.bumpiness}`,
);

try {
  for (const weightName of Object.keys(ORIGINAL_EXPERT_WEIGHTS)) {
    for (const operation of ['zero', 'double']) {
      Object.assign(EXPERT_WEIGHTS, ORIGINAL_EXPERT_WEIGHTS);
      const value = operation === 'zero'
        ? 0
        : ORIGINAL_EXPERT_WEIGHTS[weightName] * 2;
      EXPERT_WEIGHTS[weightName] = value;
      const averageLines = simulateLevel('expert');
      const operationLabel = operation === 'zero' ? '0' : 'double';
      console.log(
        `${WEIGHT_LABELS[weightName]} = ${operationLabel} (${value}) : ` +
        `${averageLines.toFixed(2)} lignes en moyenne`,
      );
    }
  }
} finally {
  Object.assign(EXPERT_WEIGHTS, ORIGINAL_EXPERT_WEIGHTS);
}
