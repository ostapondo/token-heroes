import { describe, expect, it } from 'vitest';
import { BALANCE } from './balance';
import {
  foeDamage,
  foeHp,
  heroDamage,
  heroHeal,
  heroHp,
  levelCost,
  levelsToMilestone,
} from './formulas';
import { heroById } from './roster';
import { testRoster } from './testing';

const knight = heroById(testRoster, 'knight');

describe('hero growth', () => {
  it('doubles damage at every 25th level', () => {
    expect(heroDamage(knight, 24)).toBe(knight.baseDamage * 24);
    expect(heroDamage(knight, 25)).toBe(knight.baseDamage * 25 * 2);
    expect(heroDamage(knight, 50)).toBe(knight.baseDamage * 50 * 4);
  });

  it('heals for a share of the damage the hero would deal', () => {
    expect(heroHeal(knight, 10)).toBe(Math.ceil(heroDamage(knight, 10) * BALANCE.healerShare));
  });

  it('counts the levels left to the next doubling', () => {
    expect(levelsToMilestone(24)).toBe(1);
    expect(levelsToMilestone(25)).toBe(25);
  });

  it('charges more for every next level', () => {
    const costs = [1, 10, 50, 100].map((level) => levelCost(knight, level));

    expect(costs).toEqual(costs.toSorted((a, b) => a - b));
    expect(new Set(costs).size).toBe(costs.length);
  });
});

describe('foe growth', () => {
  it('gives a boss the HP of an enemy with a tenfold scale', () => {
    expect(foeHp(20, 1, true)).toBe(foeHp(20, 10, false));
  });

  it('makes every stage tougher than the last', () => {
    expect(foeHp(41, 1, false)).toBeGreaterThan(foeHp(40, 1, false));
  });
});

const safe = (value: number) => Number.isSafeInteger(value) && value > 0;

describe('number safety', () => {
  it('keeps foes finite and exact on absurd stages', () => {
    for (const stage of [1, 150, 5_000, 1_000_000]) {
      expect(safe(foeHp(stage, 1.6, true))).toBe(true);
      expect(safe(foeDamage(stage, 1.4, true))).toBe(true);
    }
  });

  it('keeps heroes finite and exact on absurd levels', () => {
    for (const level of [1, 400, 30_000, 100_000]) {
      expect(safe(heroDamage(knight, level))).toBe(true);
      expect(safe(heroHp(knight, level))).toBe(true);
      expect(safe(levelCost(knight, level))).toBe(true);
    }
  });
});
