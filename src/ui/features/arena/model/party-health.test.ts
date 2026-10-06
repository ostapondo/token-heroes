import { CONTENT, toRoster } from '@content';
import { heroById, heroHp } from '@engine';
import { describe, expect, it } from 'vitest';
import { partyHealth } from './party-health';

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
