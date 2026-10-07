import { describe, expect, it } from 'vitest';
import { BALANCE } from './balance';
import {
  foeDamage,
  foeHp,
  heroDamage,
  healerWeight,
  heroHeal,
  heroHp,
  heroMend,
  levelCost,
  levelsToMilestone,
  partyMend,
  safeAmount,
} from './formulas';
import { heroById } from './roster';
import { skillRank } from './skills/ranks';
import { testRoster } from './testing';

const knight = heroById(testRoster, 'knight');
const ranked = (level: number) => BALANCE.skills.rankGrowth ** skillRank(level);
const cleric = heroById(testRoster, 'cleric');

describe('hero growth', () => {
  it('multiplies damage at every 25th level and a little at every skill rank', () => {
    const milestone = BALANCE.milestoneMultiplier;

    expect(heroDamage(knight, 9)).toBe(knight.baseDamage * 9);
    expect(heroDamage(knight, 24)).toBe(safeAmount(knight.baseDamage * 24 * ranked(24)));
    expect(heroDamage(knight, 25)).toBe(
      safeAmount(knight.baseDamage * 25 * milestone * ranked(25)),
    );
    expect(heroDamage(knight, 50)).toBe(
      safeAmount(knight.baseDamage * 50 * milestone ** 2 * ranked(50)),
    );
  });

  it("undoes a share of the foes' damage, more for a healer who keeps up", () => {
    const party = { hp: 10_000, level: 20, mending: healerWeight(cleric, 20, 20) };
    const atPace = heroMend(cleric, 20, party);

    expect(heroMend(cleric, 5, party)).toBeCloseTo((atPace * 5) / party.level);
    expect(heroMend(cleric, 200, party)).toBeCloseTo(atPace * BALANCE.healLevelFactor.max);
    expect(heroMend(knight, 20, party)).toBe(0);
    expect(heroHeal(cleric, 20, party, 100)).toBe(Math.ceil(atPace * 100 * cleric.attackInterval));
  });

  it('never undoes all of the damage, however many healers the party has', () => {
    expect(partyMend({ hp: 1, level: 1, mending: 1e12 })).toBeLessThan(1);
  });

  it('counts the levels left to the next doubling', () => {
    expect(levelsToMilestone(24)).toBe(1);
    expect(levelsToMilestone(25)).toBe(25);
  });

  it('charges more for every next level', () => {
    const costs = [1, 10, 50, 100].map((level) => levelCost(level));

    expect(costs).toEqual(costs.toSorted((a, b) => a - b));
    expect(new Set(costs).size).toBe(costs.length);
  });
});

describe('foe growth', () => {
  it('gives a boss the HP of an enemy scaled by the boss multiplier', () => {
    expect(foeHp(20, 1, true)).toBe(foeHp(20, BALANCE.bossHpMultiplier, false));
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
      expect(safe(levelCost(level))).toBe(true);
    }
  });
});
