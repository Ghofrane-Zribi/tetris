import { GRID_HEIGHT, GRID_WIDTH } from '../core/grid.js';

const DEFAULT_CELL_SIZE = 30;

export function createRenderer(canvas, cellSize = DEFAULT_CELL_SIZE) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Le rendu nécessite un élément canvas.');
  }

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Le contexte 2D du canvas est indisponible.');
  }

  canvas.width = GRID_WIDTH * cellSize;
  canvas.height = GRID_HEIGHT * cellSize;

  function drawCell(column, row, color) {
    context.fillStyle = color;
    context.fillRect(column * cellSize, row * cellSize, cellSize, cellSize);
    context.strokeStyle = '#171717';
    context.strokeRect(column * cellSize, row * cellSize, cellSize, cellSize);
  }

  function render(state) {
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
  }

  return { render };
}
