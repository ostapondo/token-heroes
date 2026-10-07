import { describe, expect, it } from 'vitest';
import { BALANCE } from '../balance';
import { foeDamage, foeHp } from '../formulas';
import { testRoster } from '../testing';
import { foesForStage, packSize, superBossTier, upcomingBoss } from './stages';

describe('packSize', () => {
  it('starts small and grows to the cap', () => {
    expect([1, 10, 11, 21, 31, 200].map(packSize)).toEqual([3, 3, 4, 5, 6, 6]);
  });
});

describe('superBossTier', () => {
  it('puts a medium super boss on every 50th stage and a strong one on every 100th', () => {
    expect([45, 50, 95, 100, 150, 200, 250].map(superBossTier)).toEqual([
      null,
      'medium',
      null,
      'strong',
      'medium',
      'strong',
      'medium',
    ]);
  });

  it('lands every super boss on a boss stage, the strong ones on medium stages too', () => {
    const { medium, strong } = BALANCE.superBosses;

    expect(medium.every % BALANCE.bossEvery).toBe(0);
    expect(strong.every % medium.every).toBe(0);
  });
});

describe('foesForStage', () => {
  it('sends the boss of the cycle, then each tier its own super boss', () => {
    expect([45, 50, 55, 100, 150].map((stage) => foesForStage(testRoster, stage)[0]?.id)).toEqual([
      'dragon',
      'thief',
      'dragon',
      'gate',
      'thief',
    ]);
  });

  it('makes a super boss fight like a boss further in, with more of it in health', () => {
    const { hpLead, damageLead } = BALANCE.superBosses.strong;
    const [gate] = foesForStage(testRoster, 100);

    expect(gate?.maxHp).toBe(foeHp(100 + hpLead, 1, true));
    expect(gate?.damage).toBe(foeDamage(100 + damageLead, 1, true));
  });
});

describe('upcomingBoss', () => {
  it('names the super boss from the first stage that leads to it', () => {
    expect([45, 46, 50, 51].map((stage) => upcomingBoss(testRoster, stage).id)).toEqual([
      'dragon',
      'thief',
      'thief',
      'dragon',
    ]);
  });
});
