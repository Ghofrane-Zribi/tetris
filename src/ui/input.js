const ACTIONS = {
  ArrowLeft: 'moveLeft',
  ArrowRight: 'moveRight',
  ArrowUp: 'rotate',
  ArrowDown: 'drop',
};

export function bindInput(element, game, render) {
  function handleKeyDown(event) {
    if (event.key.toLowerCase() === 'p') {
      event.preventDefault();
      if (game.getState().status === 'playing') {
        game.pause();
      } else {
        game.start();
      }
      render(game.getState());
      return;
    }

    const action = ACTIONS[event.key];
    if (!action) {
      return;
    }
    if (game.getState().status === 'game-over') {
      return;
    }

    event.preventDefault();
    game[action]();
    render(game.getState());
  }

  element.addEventListener('keydown', handleKeyDown);
  return () => element.removeEventListener('keydown', handleKeyDown);
}
