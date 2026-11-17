import { describe, expect, it } from 'vitest';
import { calculateScore, getDropInterval, getLevel } from '../src/core/scoring.js';

describe('score et progression', () => {
  it('calcule le score des lignes supprimées selon le niveau', () => {
    expect([1, 2, 3, 4].map(lines => calculateScore(lines))).toEqual([100, 300, 500, 800]);
    expect(calculateScore(2, 3)).toBe(900);
  });

  it('augmente le niveau toutes les dix lignes', () => {
    expect(getLevel(0)).toBe(1);
    expect(getLevel(9)).toBe(1);
    expect(getLevel(10)).toBe(2);
    expect(getLevel(20)).toBe(3);
  });

  it('réduit la vitesse sans descendre sous la limite', () => {
    expect(getDropInterval(1)).toBeGreaterThan(getDropInterval(2));
    expect(getDropInterval(100)).toBe(100);
  });
});
