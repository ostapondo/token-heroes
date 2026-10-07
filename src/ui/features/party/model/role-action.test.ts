import { CONTENT, toRoster } from '@content';
import { healerWeight, heroById, heroDamage, heroHp, heroMend, HeroRole } from '@engine';
import { describe, expect, it } from 'vitest';
import { roleAction } from './role-action';

const roster = toRoster(CONTENT);
const cleric = heroById(roster, 'cleric');
const party = { hp: 50_000, level: 40, mending: healerWeight(cleric, 40, 40) };

describe('roleAction', () => {
  it("shows the share of the foes' damage a healer undoes, not the damage it would deal", () => {
    expect(roleAction(cleric, 40, party)).toEqual({
      role: HeroRole.Healer,
      amount: Math.round(heroMend(cleric, 40, party) * 100),
      seconds: cleric.attackInterval,
      hp: heroHp(cleric, 40),
    });
  });

  it('shows the hit of a striker or a tank at its level', () => {
    const shieldbearer = heroById(roster, 'shieldbearer');

    expect(roleAction(shieldbearer, 101, party).amount).toBe(heroDamage(shieldbearer, 101));
    expect(roleAction(shieldbearer, 101, party).role).toBe(HeroRole.Tank);
  });

  it('shows the power an ascension adds', () => {
    const archer = heroById(roster, 'archer');
    const plain = roleAction(archer, 40, party);
    const ascended = roleAction(archer, 40, party, 2.6);

    expect(ascended.amount).toBe(Math.round(heroDamage(archer, 40) * 2.6));
    expect(ascended.hp).toBeGreaterThan(plain.hp);
  });
});
