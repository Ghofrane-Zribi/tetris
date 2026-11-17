// Les 7 tétrominos (I, O, T, S, Z, J, L) : matrices dans l’orientation 0 
export const PIECES = {
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
};

export const PIECE_COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
};

/**
 * Fait tourner une matrice carrée d’un quart de tour horaire.
 * @param {Array<Array<number>>} matrix Matrice carrée à faire tourner.
 * @returns {Array<Array<number>>} Nouvelle matrice tournée.
 * @throws {Error} Si la matrice n’est pas carrée.
 */
export function rotate(matrix) {
  const N = matrix.length;
  if (!Array.isArray(matrix) || matrix.some(row => !Array.isArray(row) || row.length !== N)) {
    throw new Error('La matrice doit être carrée.');
  }
  const result = Array.from({ length: N }, () => Array(N).fill(0));     
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      result[j][N - 1 - i] = matrix[i][j];
    }
  }
  return result;
}
