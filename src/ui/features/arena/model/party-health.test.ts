import { CONTENT, toRoster } from '@content';
import { heroById, heroHp } from '@engine';
import { describe, expect, it } from 'vitest';
import { heroesHealth, partyHealth } from './party-health';

const roster = toRoster(CONTENT);
const party = {
  heroes: [
    { heroId: 'wanderer', level: 3 },
    { heroId: 'archer', level: 2 },
  ],
};
const maxHp = heroHp(heroById(roster, 'wanderer'), 3) + heroHp(heroById(roster, 'archer'), 2);

describe('partyHealth', () => {
  it('measures the shared pool against every hero in the party', () => {
    expect(partyHealth(maxHp - 10.4, party, roster)).toEqual({ hp: maxHp - 10, maxHp });
  });

  it('never shows less than nothing or more than full', () => {
    expect(partyHealth(-25, party, roster).hp).toBe(0);
    expect(partyHealth(maxHp + 5, party, roster).hp).toBe(maxHp);
  });
});

describe('heroesHealth', () => {
  it('shows each hero against its own maximum, in party order', () => {
    const vitals = { wanderer: { hp: 4.2 }, archer: { hp: 0 } };
    const health = heroesHealth(vitals, party, roster, CONTENT);

    expect(health.map((hero) => [hero.heroId, hero.hp])).toEqual([
      ['wanderer', 5],
      ['archer', 0],
    ]);
    expect(health[0]?.maxHp).toBe(heroHp(heroById(roster, 'wanderer'), 3));
  });

  it('counts a hero the battle has not met yet at full health', () => {
    const [wanderer] = heroesHealth({}, party, roster, CONTENT);

    expect(wanderer?.hp).toBe(wanderer?.maxHp);
  });
});
