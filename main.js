import { createGame } from './src/core/game.js';
import { createRenderer } from './src/ui/renderer.js';
import { bindInput } from './src/ui/input.js';

const canvas = document.querySelector('#game-canvas');
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Le canvas du jeu est introuvable.');
}

const game = createGame();
const renderer = createRenderer(canvas);
const render = state => renderer.render(state);

bindInput(document, game, render);
render(game.getState());

setInterval(() => {
  game.drop();
  render(game.getState());
}, 700);
