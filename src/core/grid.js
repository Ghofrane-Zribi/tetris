export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;

/**
 * Crée une grille vide aux dimensions demandées.
 * @param {number} [width=GRID_WIDTH] Largeur de la grille.
 * @param {number} [height=GRID_HEIGHT] Hauteur de la grille.
 * @returns {Array<Array<null>>} Grille remplie de cases vides.
 * @throws {Error} Si une dimension n’est pas un entier positif.
 */
export function createGrid(width = GRID_WIDTH, height = GRID_HEIGHT) {
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    throw new Error('Les dimensions de la grille doivent être des entiers positifs.');
  }

  return Array.from({ length: height }, () => Array(width).fill(null));
}

/**
 * Vérifie qu’une pièce peut occuper une position de la grille.
 * @param {Array<Array<*>>} grid Grille à vérifier.
 * @param {Array<Array<number>>} matrix Matrice de la pièce.
 * @param {number} row Ligne de départ de la pièce.
 * @param {number} column Colonne de départ de la pièce.
 * @returns {boolean} Vrai si la position est valide.
 * @throws {TypeError} Si la grille ou la matrice n’a pas une structure exploitable.
 */
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

/**
 * Fixe une pièce sur une copie de la grille.
 * @param {Array<Array<*>>} grid Grille d’origine.
 * @param {Array<Array<number>>} matrix Matrice de la pièce.
 * @param {number} row Ligne de fixation.
 * @param {number} column Colonne de fixation.
 * @param {*} color Couleur enregistrée dans les cases occupées.
 * @returns {Array<Array<*>>} Nouvelle grille contenant la pièce.
 * @throws {Error} Si la pièce ne peut pas être fixée à la position indiquée.
 */
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

/**
 * Supprime les lignes complètes et ajoute des lignes vides en haut.
 * @param {Array<Array<*>>} grid Grille à traiter.
 * @returns {{grid: Array<Array<*>>, clearedLines: number}} Grille nettoyée et nombre de lignes supprimées.
 * @throws {TypeError} Si la grille n’a pas une structure exploitable.
 */
export function clearCompletedLines(grid) {
  const remainingRows = grid.filter(row => row.some(cell => cell === null));
  const clearedLines = grid.length - remainingRows.length;
  const emptyRows = Array.from({ length: clearedLines }, () => Array(grid[0].length).fill(null));

  return {
    grid: [...emptyRows, ...remainingRows],
    clearedLines,
  };
}
