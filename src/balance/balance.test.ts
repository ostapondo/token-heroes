import { CONTENT, toRoster } from '@content';
import {
  AttackStyle,
  designHero,
  healerWeight,
  heroById,
  heroHp,
  heroMend,
  HeroRole,
} from '@engine';
import { describe, expect, it } from 'vitest';
import { judgeParty, standardScenarios } from './check';
import { paceCurve } from './pace';
import { PACE_RULES } from './pace-rules';
import { judge } from './rules';
import { heroSheet, stageSheet } from './sheets';
import { runParty } from './simulate';

const roster = toRoster(CONTENT);

describe('sheets', () => {
  it('reports the share of damage the battle really undoes', () => {
    const cleric = heroSheet(roster, 'cleric', 94);
    const stats = heroById(roster, 'cleric');
    const alone = { hp: heroHp(stats, 94), level: 94, mending: healerWeight(stats, 94, 94) };

    expect(cleric.mend).toBe(heroMend(stats, 94, alone));
    expect(cleric.damagePerSecond).toBe(0);
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
  it('flags a healer who has fallen far behind the party', () => {
    const stats = heroById(roster, 'cleric');
    const party = { hp: 1, level: 100, mending: healerWeight(stats, 1, 100) };
    const cleric = heroSheet(roster, 'cleric', 1, party);
    const run = runParty({ heroes: [] }, roster, { maxSeconds: 0 });
    const healers = judge({ heroes: [cleric], run, frontier: stageSheet(roster, 50) }).find(
      (finding) => finding.rule === 'healers-keep-up',
    );

    expect(healers?.passed).toBe(false);
    expect(healers?.measured).toBeCloseTo(heroMend(stats, 1, party));
  });

  it('judges every standard party with a run and its findings', () => {
    const [starter] = standardScenarios(roster);
    const verdict = starter ? judgeParty(roster, starter) : null;

    expect(verdict?.findings.length).toBeGreaterThan(0);
  });
});

describe('a growing roster', () => {
  const newcomers = [
    { role: HeroRole.Striker, attack: AttackStyle.Slash },
    { role: HeroRole.Tank, attack: AttackStyle.Bash },
    { role: HeroRole.Healer, attack: AttackStyle.Heal },
  ].map(({ role, attack }, index) =>
    designHero({
      id: `newcomer-${index}`,
      order: roster.heroes.length + index + 1,
      role,
      attack,
      attackInterval: 1.2,
    }),
  );
  const grown = { ...roster, heroes: [...roster.heroes, ...newcomers] };

  it('keeps every pace rule when new heroes join after the last one', () => {
    const context = { roster: grown, steady: paceCurve(grown), greedy: [] };
    const failed = PACE_RULES.map((rule) => ({ id: rule.id, ...rule.judge(context) })).filter(
      (finding) => !finding.passed,
    );

    expect(failed).toEqual([]);
  });
});
