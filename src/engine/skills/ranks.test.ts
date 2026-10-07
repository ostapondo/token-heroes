import { describe, expect, it } from 'vitest';
import { BALANCE } from '../balance';
import { designHero } from '../design';
import { AttackStyle, HeroRole } from '../types';
import {
  attackShare,
  damageRankPower,
  formTier,
  levelOfRank,
  skillRank,
  skillShare,
  tiered,
} from './ranks';
import { SkillEffectKind, SkillTrigger, type SkillBlueprint } from './types';

const skill = (id: string, slot: number): SkillBlueprint => ({
  id,
  hero: 'hunter',
  slot,
  trigger: SkillTrigger.Cooldown,
  cooldown: 10,
  effects: [{ kind: SkillEffectKind.Hit, share: 1 }],
});
const blueprint = {
  id: 'hunter',
  order: 2,
  role: HeroRole.Striker,
  attack: AttackStyle.Arrow,
  attackInterval: 1,
};
const single = designHero(blueprint, [skill('rain', 1)]);
const double = designHero(blueprint, [skill('rain', 1), skill('snipe', 2)]);

describe('skill ranks', () => {
  it('open at the unlock level and rise every ten levels', () => {
    expect([9, 10, 19, 20, 35, 50].map((level) => skillRank(level))).toEqual([0, 1, 1, 2, 3, 5]);
    expect(levelOfRank(1)).toBe(BALANCE.skills.unlockLevel);
    expect(levelOfRank(5)).toBe(50);
  });

  it('rank a second skill five levels behind the first, from the same unlock', () => {
    const [, snipe] = double.skills;

    expect(snipe?.lag).toBe(5);
    expect([10, 24, 25, 55].map((level) => skillRank(level, 5))).toEqual([1, 1, 2, 5]);
    expect(levelOfRank(2, 5)).toBe(25);
  });

  it('change the form at ranks three and five', () => {
    expect([1, 2, 3, 4, 5, 9].map(formTier)).toEqual([0, 0, 1, 1, 2, 2]);
    expect(tiered([1, 3, 6], 4)).toBe(3);
    expect(tiered(2, 9)).toBe(2);
  });
});

describe('skill shares', () => {
  it('leave the whole output to the attack before the skill opens', () => {
    const [rain] = single.skills;

    if (!rain) throw new Error('The hunter has no skill');
    expect(attackShare(single, 9)).toBe(1);
    expect(skillShare(single, rain, 9)).toBe(0);
  });

  it('move a share of the attack into the skill with every rank, down to the floor', () => {
    const { first, floor } = BALANCE.skills.attackShare;

    expect(attackShare(single, 10)).toBeCloseTo(first);
    expect(attackShare(single, 30)).toBeLessThan(attackShare(single, 20));
    expect(attackShare(single, 200)).toBe(floor);
  });

  it('add up to the rank power, so a skill shapes the output without adding to it', () => {
    for (const hero of [single, double]) {
      for (const level of [10, 22, 37, 64]) {
        const skills = hero.skills.reduce((sum, each) => sum + skillShare(hero, each, level), 0);

        expect(attackShare(hero, level) + skills).toBeCloseTo(damageRankPower(hero, level));
      }
    }
  });

  it('never put a hero with a lagging second skill ahead of a hero with one', () => {
    for (const level of [10, 20, 25, 30, 45, 52]) {
      expect(damageRankPower(double, level)).toBeLessThanOrEqual(damageRankPower(single, level));
    }
    expect(damageRankPower(double, 25)).toBeCloseTo(damageRankPower(single, 25));
  });
});
