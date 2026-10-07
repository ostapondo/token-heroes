import { CONTENT, toRoster } from '@content';
import { levelCost, heroById, partyVitals } from '@engine';
import { describe, expect, it } from 'vitest';
import { RECRUITS_SHOWN } from '../constants';
import { roleAction } from './role-action';
import { partyRows } from './party-rows';

const roster = toRoster(CONTENT);
const party = { heroes: [{ heroId: 'wanderer', level: 24 }] };
const wandererCost = levelCost(24);

describe('partyRows', () => {
  it('prices the next level and tracks the way to the next doubling', () => {
    const { members } = partyRows(party, { balance: wandererCost, burned: 0 }, roster, CONTENT);

    expect(members).toMatchObject([
      {
        heroId: 'wanderer',
        name: 'Wanderer',
        level: 24,
        cost: wandererCost,
        affordable: true,
        levelsToMilestone: 1,
        milestoneProgress: 24 / 25,
        action: roleAction(heroById(roster, 'wanderer'), 24, partyVitals(party, roster)),
      },
    ]);
  });

  it('offers the next heroes in order, locked until enough tokens burn', () => {
    const { recruits } = partyRows(party, { balance: 0, burned: 0 }, roster, CONTENT);

    expect(recruits.map((recruit) => recruit.heroId)).toEqual(['archer', 'shieldbearer']);
    expect(recruits).toHaveLength(RECRUITS_SHOWN);
    expect(recruits.every((recruit) => recruit.unlocked && !recruit.affordable)).toBe(true);
  });

  it('marks a recruit locked below its token threshold', () => {
    const veterans = {
      heroes: ['wanderer', 'archer', 'shieldbearer', 'cleric', 'fire-mage'].map((heroId) => ({
        heroId,
        level: 1,
      })),
    };
    const [rogue] = partyRows(
      veterans,
      { balance: 1e9, burned: 49_999_999 },
      roster,
      CONTENT,
    ).recruits;

    expect(rogue).toMatchObject({ heroId: 'rogue', unlocked: false });
  });
});
