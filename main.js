import { GameManager } from './src/core/gameManager.js';
import { createRenderer, renderPlayerInfo } from './src/ui/renderer.js';
import { bindInput } from './src/ui/input.js';

const modeScreen = document.querySelector('#mode-screen');
const gameScreen = document.querySelector('#game-screen');
const modeForm = document.querySelector('#mode-form');
const canvas = document.querySelector('#game-canvas');
const previewCanvas = document.querySelector('#next-piece-canvas');
const humanPseudoElement = document.querySelector('#human-pseudo');
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Le canvas du jeu est introuvable.');
}
if (!(previewCanvas instanceof HTMLCanvasElement)) {
  throw new Error('Le canvas de la pièce suivante est introuvable.');
}

const opponentContainer = document.querySelector('#opponents');
const playersBoard = document.querySelector('#players-board');
const humanPanel = document.querySelector('.player-panel');
const resultsPanel = document.querySelector('#results');
const resultsTitle = document.querySelector('#results-title');
const winnerElement = document.querySelector('#winner');
const podiumElement = document.querySelector('#podium');
const pauseButton = document.querySelector('#pause-button');
const startButton = document.querySelector('#start-button');
const restartButton = document.querySelector('#restart-button');

let manager;
let renderer;
let opponentRenderers = [];
let unbindInput;

function render(state = manager.getState()) {
  const human = state.players[state.humanIndex];
  renderer.render(human);
  renderPlayerInfo(humanPanel, human);
  pauseButton.textContent = human.status === 'paused' ? 'Reprendre' : 'Pause';
  state.players.slice(1).forEach((player, index) => {
    opponentRenderers[index].renderer.render(player);
    renderPlayerInfo(opponentRenderers[index].card, player);
  });
  renderResults(state);
}

function renderResults(state) {
  const finished = state.status === 'game-over';
  resultsPanel.hidden = !finished;
  if (!finished) {
    return;
  }

  resultsTitle.textContent = state.winner ? 'Gagnant' : 'Classement final';
  winnerElement.textContent = state.winner
    ? `Gagnant : ${state.winner.pseudo}`
    : 'Le gagnant sera déterminé lorsque les adversaires joueront.';
  podiumElement.replaceChildren();
  state.podium.forEach(player => {
    const item = document.createElement('li');
    item.textContent = `${player.pseudo} — ${player.score} points, niveau ${player.level}`;
    podiumElement.append(item);
  });
}

function createOpponentViews(state) {
  opponentContainer.replaceChildren();
  opponentRenderers = [];
  playersBoard.classList.toggle('players-board--solo', state.players.length === 1);
  humanPseudoElement.textContent = state.players[state.humanIndex].pseudo;
  state.players.slice(1).forEach(player => {
    const card = document.createElement('article');
    card.className = 'opponent-card player-panel';
    const title = document.createElement('h2');
    title.textContent = player.pseudo;
    const opponentCanvas = document.createElement('canvas');
    opponentCanvas.className = 'opponent-canvas';
    opponentCanvas.setAttribute('aria-label', `Grille de ${player.pseudo}`);
    const stats = document.createElement('div');
    stats.className = 'opponent-stats';
    stats.innerHTML = `
      <p>Score <strong class="player-score">0</strong></p>
      <p>Niveau <strong class="player-level">1</strong></p>
      <p>Lignes <strong class="player-lines">0</strong></p>
      <p class="player-status">Prêt</p>
    `;
    card.append(title, opponentCanvas, stats);
    opponentContainer.append(card);
    opponentRenderers.push({
      card,
      renderer: createRenderer(opponentCanvas),
    });
  });
}

modeForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(modeForm);
  manager = new GameManager({
    mode: formData.get('mode'),
    pseudo: String(formData.get('pseudo')).trim(),
  });
  renderer = createRenderer(canvas, previewCanvas);
  const state = manager.getState();
  createOpponentViews(state);
  unbindInput?.();
  unbindInput = bindInput(document, manager, render);
  modeScreen.hidden = true;
  gameScreen.hidden = false;
  resultsPanel.hidden = true;
  render(state);
});

startButton.addEventListener('click', () => {
  manager.start();
  render();
});
pauseButton.addEventListener('click', () => {
  if (manager.getState().status === 'playing') {
    manager.pause();
  } else {
    manager.start();
  }
  render();
});
restartButton.addEventListener('click', () => {
  manager.restart();
  render();
});

let elapsed = 0;
let lastTimestamp = performance.now();
function tick(timestamp) {
  elapsed += timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  if (manager) {
    const state = manager.getState();
    const human = state.players[state.humanIndex];
    if (state.status === 'playing' && elapsed >= human.dropInterval) {
      manager.drop();
      elapsed = 0;
      render();
    }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
