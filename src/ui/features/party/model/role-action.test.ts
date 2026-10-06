import { CONTENT, toRoster } from '@content';
import { heroById, heroDamage, heroHeal, heroHp, HeroRole } from '@engine';
import { describe, expect, it } from 'vitest';
import { roleAction } from './role-action';

const roster = toRoster(CONTENT);
const party = { hp: 50_000, level: 40 };

describe('roleAction', () => {
  it('shows what a healer restores, not the damage it would deal', () => {
    const cleric = heroById(roster, 'cleric');

    expect(roleAction(cleric, 40, party)).toEqual({
      role: HeroRole.Healer,
      amount: heroHeal(cleric, 40, party),
      seconds: cleric.attackInterval,
      hp: heroHp(cleric, 40),
    });
  });

  it('shows the hit of a striker or a tank at its level', () => {
    const shieldbearer = heroById(roster, 'shieldbearer');

    expect(roleAction(shieldbearer, 101, party).amount).toBe(heroDamage(shieldbearer, 101));
    expect(roleAction(shieldbearer, 101, party).role).toBe(HeroRole.Tank);
  });
});
