import { createGame } from './src/core/game.js';
import { createRenderer } from './src/ui/renderer.js';
import { bindInput } from './src/ui/input.js';

const canvas = document.querySelector('#game-canvas');
const previewCanvas = document.querySelector('#next-piece-canvas');
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Le canvas du jeu est introuvable.');
}
if (!(previewCanvas instanceof HTMLCanvasElement)) {
  throw new Error('Le canvas de la pièce suivante est introuvable.');
}

const game = createGame();
const renderer = createRenderer(canvas, previewCanvas);
const scoreElement = document.querySelector('#score');
const levelElement = document.querySelector('#level');
const linesElement = document.querySelector('#lines');
const statusElement = document.querySelector('#status');
const startButton = document.querySelector('#start-button');
const pauseButton = document.querySelector('#pause-button');
const restartButton = document.querySelector('#restart-button');

function render(state) {
  renderer.render(state);
  scoreElement.textContent = String(state.score);
  levelElement.textContent = String(state.level);
  linesElement.textContent = String(state.lines);
  const statusText = {
    ready: 'Prêt',
    playing: 'En cours',
    paused: 'Pause',
    'game-over': `Game Over — score final : ${state.score}`,
  };
  statusElement.textContent = statusText[state.status];
  pauseButton.textContent = state.status === 'paused' ? 'Reprendre' : 'Pause';
}

bindInput(document, game, render);
startButton.addEventListener('click', () => {
  game.start();
  render(game.getState());
});
pauseButton.addEventListener('click', () => {
  if (game.getState().status === 'playing') {
    game.pause();
  } else {
    game.start();
  }
  render(game.getState());
});
restartButton.addEventListener('click', () => {
  game.restart();
  render(game.getState());
});
render(game.getState());

let elapsed = 0;
let lastTimestamp = performance.now();
function tick(timestamp) {
  elapsed += timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  const state = game.getState();
  if (state.status === 'playing' && elapsed >= state.dropInterval) {
    game.drop();
    elapsed = 0;
    render(game.getState());
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
