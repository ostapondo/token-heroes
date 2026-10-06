import { CONTENT, toRoster } from '@content';
import { BALANCE, heroById, heroHeal } from '@engine';
import { describe, expect, it } from 'vitest';
import { judgeParty, standardScenarios } from './check';
import { judge } from './rules';
import { heroSheet, stageSheet } from './sheets';
import { runParty } from './simulate';

const roster = toRoster(CONTENT);

describe('sheets', () => {
  it('reports the heal the battle really casts', () => {
    const cleric = heroSheet(roster, 'cleric', 94);

    expect(cleric.heal).toBe(heroHeal(heroById(roster, 'cleric'), 94));
    expect(cleric.healPerSecond).toBeCloseTo(cleric.heal / cleric.interval);
    expect(cleric.damagePerSecond).toBe(0);
  });

  it('gives a boss stage its timer and a pack stage none', () => {
    expect(stageSheet(roster, BALANCE.bossEvery).timeLimit).toBe(BALANCE.bossTimeLimit);
    expect(stageSheet(roster, 1).timeLimit).toBeNull();
  });
});

describe('runParty', () => {
  const party = { heroes: [{ heroId: 'wanderer', level: 5 }] };

  it('finds the stage where a party is stuck, the same way every time', () => {
    const first = runParty(party, roster);

    expect(first.frontier).not.toBeNull();
    expect(runParty(party, roster)).toEqual(first);
  });

  it('takes a stronger party further', () => {
    const weak = runParty(party, roster).frontier?.stage ?? 0;
    const strong = runParty({ heroes: [{ heroId: 'wanderer', level: 40 }] }, roster).frontier;

    expect(strong?.stage ?? Infinity).toBeGreaterThan(weak);
  });
});

describe('rules', () => {
  it('flags a level 94 cleric that heals 1% of what the stage 85 boss deals', () => {
    const heroes = [heroSheet(roster, 'cleric', 94), heroSheet(roster, 'wanderer', 94)];
    const frontier = stageSheet(roster, 85);
    const run = runParty({ heroes: [] }, roster, { maxSeconds: 0 });
    const healers = judge({ heroes, run, frontier }).find(
      (finding) => finding.rule === 'healers-keep-up',
    );

    expect(healers?.passed).toBe(false);
    expect(healers?.measured).toBeLessThan(0.02);
  });

  it('judges every standard party with a run and its findings', () => {
    const [starter] = standardScenarios(CONTENT);
    const verdict = starter ? judgeParty(roster, starter) : null;

    expect(verdict?.findings.length).toBeGreaterThan(0);
  });
});
