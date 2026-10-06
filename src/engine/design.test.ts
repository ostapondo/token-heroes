import { describe, expect, it } from 'vitest';
import { BALANCE } from './balance';
import { designHero } from './design';
import { AttackStyle, HeroRole } from './types';

const striker = (order: number, focus = 0) =>
  designHero({
    id: `hero-${order}`,
    order,
    role: HeroRole.Striker,
    attack: AttackStyle.Slash,
    attackInterval: 1,
    focus,
  });

describe('designHero', () => {
  it('makes every later hero stronger at the same level cost', () => {
    const powers = [1, 2, 5, 10, 14].map((order) => striker(order).baseDamage);

    expect(powers).toEqual(powers.toSorted((left, right) => left - right));
    expect(new Set(powers).size).toBe(powers.length);
  });

  it('gives the first hero for free and opens the starters at once', () => {
    expect(striker(1).hireCost).toBe(0);
    expect(striker(BALANCE.starterHeroes).unlockAtTokens).toBe(0);
    expect(striker(BALANCE.starterHeroes + 1).unlockAtTokens).toBe(BALANCE.unlockFirst);
  });

  it('asks more to hire and more burned tokens for every later hero', () => {
    const later = [2, 3, 6, 7, 12].map(striker);

    for (const [index, hero] of later.slice(1).entries()) {
      expect(hero.hireCost).toBeGreaterThan(later[index]?.hireCost ?? Infinity);
    }
    expect(striker(7).unlockAtTokens).toBeGreaterThan(striker(6).unlockAtTokens);
  });

  it('trades toughness for offence with focus, within the same budget', () => {
    const even = striker(3);
    const glass = striker(3, 0.3);

    expect(glass.baseDamage).toBeGreaterThan(even.baseDamage);
    expect(glass.baseHp).toBeLessThan(even.baseHp);
    expect(glass.baseDamage / even.baseDamage + glass.baseHp / even.baseHp).toBeCloseTo(2);
  });

  it('times damage per hit to the attack speed so damage per second stays the budget', () => {
    const quick = designHero({ ...striker(4), order: 4, attackInterval: 0.5 });
    const slow = designHero({ ...striker(4), order: 4, attackInterval: 2 });

    expect(quick.baseDamage / quick.attackInterval).toBeCloseTo(
      slow.baseDamage / slow.attackInterval,
    );
  });
});
