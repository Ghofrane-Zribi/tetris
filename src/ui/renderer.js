import { GRID_HEIGHT, GRID_WIDTH } from '../core/grid.js';

const DEFAULT_CELL_SIZE = 30;
const CLEAR_ANIMATION_DURATION = 260;

const STATUS_LABELS = {
  ready: 'Prêt',
  playing: 'En cours',
  paused: 'Pause',
  'game-over': 'Game Over',
};

export function renderPlayerInfo(container, state) {
  const scoreElement = container.querySelector('.player-score');
  const levelElement = container.querySelector('.player-level');
  const linesElement = container.querySelector('.player-lines');
  const statusElement = container.querySelector('.player-status');

  if (!scoreElement || !levelElement || !linesElement || !statusElement) {
    throw new Error('Le panneau joueur est incomplet.');
  }

  scoreElement.textContent = String(state.score);
  levelElement.textContent = String(state.level);
  linesElement.textContent = String(state.lines);
  statusElement.textContent = state.status === 'game-over'
    ? `Game Over — score final : ${state.score}`
    : STATUS_LABELS[state.status];
}

export function createRenderer(canvas, previewCanvasOrCellSize, cellSize = DEFAULT_CELL_SIZE) {
  const previewCanvas =
    typeof previewCanvasOrCellSize === 'number' ? undefined : previewCanvasOrCellSize;
  if (typeof previewCanvasOrCellSize === 'number') {
    cellSize = previewCanvasOrCellSize;
  }

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Le rendu nécessite un élément canvas.');
  }
  if (previewCanvas && !(previewCanvas instanceof HTMLCanvasElement)) {
    throw new Error('Le rendu de la pièce suivante nécessite un élément canvas.');
  }

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Le contexte 2D du canvas est indisponible.');
  }
  const previewContext = previewCanvas?.getContext('2d');
  if (previewCanvas && !previewContext) {
    throw new Error('Le contexte 2D de la pièce suivante est indisponible.');
  }

  canvas.width = GRID_WIDTH * cellSize;
  canvas.height = GRID_HEIGHT * cellSize;
  if (previewCanvas) {
    previewCanvas.width = cellSize * 4;
    previewCanvas.height = cellSize * 4;
  }

  function drawCell(column, row, color) {
    context.fillStyle = color;
    context.fillRect(column * cellSize, row * cellSize, cellSize, cellSize);
    context.strokeStyle = '#171717';
    context.strokeRect(column * cellSize, row * cellSize, cellSize, cellSize);
  }

  function drawBoard(state, clearProgress = 0) {
    context.fillStyle = '#262626';
    context.fillRect(0, 0, canvas.width, canvas.height);

    state.grid.forEach((row, rowIndex) => {
      row.forEach((color, columnIndex) => {
        if (color !== null) {
          drawCell(columnIndex, rowIndex, color);
        }
      });
    });

    state.current.matrix.forEach((row, rowIndex) => {
      row.forEach((filled, columnIndex) => {
        if (filled) {
          drawCell(
            state.current.column + columnIndex,
            state.current.row + rowIndex,
            state.current.color,
          );
        }
      });
    });

    if (clearProgress > 0) {
      context.fillStyle = `rgba(255, 255, 255, ${0.2 + clearProgress * 0.6})`;
      state.lastClearedRows.forEach(row => {
        context.fillRect(0, row * cellSize, canvas.width, cellSize);
      });
    }

    if (state.status === 'game-over') {
      context.fillStyle = 'rgba(0, 0, 0, 0.72)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#ffffff';
      context.font = 'bold 24px system-ui, sans-serif';
      context.textAlign = 'center';
      context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 12);
      context.font = '16px system-ui, sans-serif';
      context.fillText(`Score final : ${state.score}`, canvas.width / 2, canvas.height / 2 + 20);
      context.textAlign = 'start';
    }
  }

  function drawPreview(piece) {
    if (!previewContext || !previewCanvas) {
      return;
    }

    previewContext.fillStyle = '#262626';
    previewContext.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    const offsetColumn = Math.floor((4 - piece.matrix[0].length) / 2);
    const offsetRow = Math.floor((4 - piece.matrix.length) / 2);
    piece.matrix.forEach((row, rowIndex) => {
      row.forEach((filled, columnIndex) => {
        if (filled) {
          previewContext.fillStyle = piece.color;
          previewContext.fillRect(
            (offsetColumn + columnIndex) * cellSize,
            (offsetRow + rowIndex) * cellSize,
            cellSize,
            cellSize,
          );
          previewContext.strokeStyle = '#171717';
          previewContext.strokeRect(
            (offsetColumn + columnIndex) * cellSize,
            (offsetRow + rowIndex) * cellSize,
            cellSize,
            cellSize,
          );
        }
      });
    });
  }

  let animatedClearId = 0;
  let animationToken = 0;

  function render(state) {
    const token = ++animationToken;
    drawBoard(state);
    drawPreview(state.next);

    if (!state.lastClearedRows.length || state.clearAnimationId === animatedClearId) {
      return;
    }

    animatedClearId = state.clearAnimationId;
    const startedAt = performance.now();
    function animate(timestamp) {
      if (token !== animationToken) {
        return;
      }
      const progress = Math.min((timestamp - startedAt) / CLEAR_ANIMATION_DURATION, 1);
      drawBoard(state, 1 - progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate);
  }

  return { render };
}
