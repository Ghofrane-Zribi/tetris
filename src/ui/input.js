const ACTIONS = {
  ArrowLeft: 'moveLeft',
  ArrowRight: 'moveRight',
  ArrowUp: 'rotate',
  ArrowDown: 'drop',
};

export function bindInput(element, game, render) {
  function handleKeyDown(event) {
    const action = ACTIONS[event.key];
    if (!action) {
      return;
    }

    event.preventDefault();
    game[action]();
    render(game.getState());
  }

  element.addEventListener('keydown', handleKeyDown);
  return () => element.removeEventListener('keydown', handleKeyDown);
}
