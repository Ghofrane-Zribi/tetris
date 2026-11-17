const LINE_SCORES = [0, 100, 300, 500, 800];
const BASE_DROP_INTERVAL = 700;
const MIN_DROP_INTERVAL = 100;
const DROP_INTERVAL_STEP = 60;

export function calculateScore(clearedLines, level = 1) {
  if (!Number.isInteger(clearedLines) || clearedLines < 0 || clearedLines > 4) {
    throw new Error('Le nombre de lignes supprimées doit être compris entre 0 et 4.');
  }
  if (!Number.isInteger(level) || level < 1) {
    throw new Error('Le niveau doit être un entier positif.');
  }

  return LINE_SCORES[clearedLines] * level;
}

export function getLevel(lines) {
  if (!Number.isInteger(lines) || lines < 0) {
    throw new Error('Le nombre de lignes doit être un entier positif ou nul.');
  }

  return Math.floor(lines / 10) + 1;
}

export function getDropInterval(level) {
  if (!Number.isInteger(level) || level < 1) {
    throw new Error('Le niveau doit être un entier positif.');
  }

  return Math.max(MIN_DROP_INTERVAL, BASE_DROP_INTERVAL - (level - 1) * DROP_INTERVAL_STEP);
}
