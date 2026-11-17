import { describe, expect, it } from 'vitest';
import { calculateScore, getDropInterval, getLevel } from '../src/core/scoring.js';

describe('score et progression', () => {
  it('attribue 100 points pour une ligne', () => {
    expect(calculateScore(1)).toBe(100);
  });

  it('attribue 300 points pour deux lignes', () => {
    expect(calculateScore(2)).toBe(300);
  });

  it('attribue 500 points pour trois lignes', () => {
    expect(calculateScore(3)).toBe(500);
  });

  it('attribue 800 points pour quatre lignes', () => {
    expect(calculateScore(4)).toBe(800);
  });

  it('multiplie le score par le niveau', () => {
    expect(calculateScore(2, 3)).toBe(900);
  });

  it('commence au niveau 1 sans ligne supprimée', () => {
    expect(getLevel(0)).toBe(1);
  });

  it('reste au niveau 1 avec neuf lignes', () => {
    expect(getLevel(9)).toBe(1);
  });

  it('passe au niveau 2 à dix lignes', () => {
    expect(getLevel(10)).toBe(2);
  });

  it('passe au niveau 3 à vingt lignes', () => {
    expect(getLevel(20)).toBe(3);
  });

  it('a un intervalle de 700 ms au niveau 1', () => {
    expect(getDropInterval(1)).toBe(700);
  });

  it('a un intervalle de 640 ms au niveau 2', () => {
    expect(getDropInterval(2)).toBe(640);
  });

  it('a un intervalle de 580 ms au niveau 3', () => {
    expect(getDropInterval(3)).toBe(580);
  });

  it('plafonne la vitesse à 100 ms', () => {
    expect(getDropInterval(100)).toBe(100);
  });

  it('rejette un nombre de lignes supprimées invalide', () => {
    expect(() => calculateScore(5)).toThrow(
      'Le nombre de lignes supprimées doit être compris entre 0 et 4.',
    );
  });

  it('rejette un niveau invalide pour le calcul du score', () => {
    expect(() => calculateScore(1, 0)).toThrow('Le niveau doit être un entier positif.');
  });

  it('rejette un nombre de lignes négatif', () => {
    expect(() => getLevel(-1)).toThrow('Le nombre de lignes doit être un entier positif ou nul.');
  });

  it('rejette un niveau invalide pour la vitesse', () => {
    expect(() => getDropInterval(0)).toThrow('Le niveau doit être un entier positif.');
  });
});
