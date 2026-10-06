import { describe, expect, it } from 'vitest';
import { BALANCE } from '../balance';
import { partyMaxHp, strikeDamage } from '../party';
import { partyOf, testRoster } from '../testing';
import { ascend, ascensionOffer } from './ascension';
import { newGame } from './save';

const atStage = (bestStage: number) => ({
  ...newGame(testRoster, 'knight', 0, 1),
  party: partyOf(['knight', 80], ['cleric', 40]),
  bestStage,
});

describe('ascension', () => {
  it('opens once the party has gone deep enough', () => {
    expect(ascensionOffer(atStage(BALANCE.ascension.minStage - 1)).available).toBe(false);
    expect(ascensionOffer(atStage(BALANCE.ascension.minStage)).available).toBe(true);
  });

  it('sends the party back to stage 1 with every hero, level and its new power', () => {
    const before = atStage(130);
    const after = ascend(before, testRoster, 5);

    expect(after.battle.stage).toBe(1);
    expect(after.bestStage).toBe(130);
    expect(after.party.heroes).toEqual(before.party.heroes);
    expect(after.party.renown).toBe(130);
    expect(ascensionOffer(before).nextPower).toBeGreaterThan(ascensionOffer(before).power);
  });

  it('makes the same heroes hit harder and stand longer', () => {
    const party = partyOf(['knight', 80], ['cleric', 40]);
    const renowned = { ...party, renown: 130 };

    expect(strikeDamage(renowned, testRoster)).toBeGreaterThan(strikeDamage(party, testRoster));
    expect(partyMaxHp(renowned, testRoster)).toBeGreaterThan(partyMaxHp(party, testRoster));
  });

  it('gives nothing to ascend again without going deeper', () => {
    const once = ascend(atStage(130), testRoster, 5);

    expect(ascensionOffer(once).available).toBe(false);
    expect(ascend(once, testRoster, 6)).toBe(once);
  });
});
