export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;

export function createGrid(width = GRID_WIDTH, height = GRID_HEIGHT) {
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    throw new Error('Les dimensions de la grille doivent être des entiers positifs.');
  }

  return Array.from({ length: height }, () => Array(width).fill(null));
}

export function isValidPosition(grid, matrix, row, column) {
  for (let matrixRow = 0; matrixRow < matrix.length; matrixRow++) {
    for (let matrixColumn = 0; matrixColumn < matrix[matrixRow].length; matrixColumn++) {
      if (!matrix[matrixRow][matrixColumn]) {
        continue;
      }

      const gridRow = row + matrixRow;
      const gridColumn = column + matrixColumn;
      if (
        gridRow < 0 ||
        gridRow >= grid.length ||
        gridColumn < 0 ||
        gridColumn >= grid[0].length ||
        grid[gridRow][gridColumn] !== null
      ) {
        return false;
      }
    }
  }

  return true;
}

export function lockPiece(grid, matrix, row, column, color) {
  if (!isValidPosition(grid, matrix, row, column)) {
    throw new Error('La pièce ne peut pas être fixée à cette position.');
  }

  const updatedGrid = grid.map(gridRow => [...gridRow]);
  for (let matrixRow = 0; matrixRow < matrix.length; matrixRow++) {
    for (let matrixColumn = 0; matrixColumn < matrix[matrixRow].length; matrixColumn++) {
      if (matrix[matrixRow][matrixColumn]) {
        updatedGrid[row + matrixRow][column + matrixColumn] = color;
      }
    }
  }

  return updatedGrid;
}

export function clearCompletedLines(grid) {
  const remainingRows = grid.filter(row => row.some(cell => cell === null));
  const clearedLines = grid.length - remainingRows.length;
  const emptyRows = Array.from({ length: clearedLines }, () => Array(grid[0].length).fill(null));

  return {
    grid: [...emptyRows, ...remainingRows],
    clearedLines,
  };
}
