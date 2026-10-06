import { describe, expect, it } from 'vitest';
import { costToLevel, levelCost } from '../formulas';
import { partyOf, testRoster } from '../testing';
import { rebalanceParty } from './rebalance';
import { newGame, upgradeSave } from './save';
import { saveFromWire } from './save-wire';

const spentOn = (levels: readonly number[]) =>
  levels.reduce((sum, level) => sum + costToLevel(level), 0);

describe('rebalanceParty', () => {
  it('re-buys an old party with what was spent and keeps its shape', () => {
    const old = partyOf(['knight', 150], ['cleric', 120], ['guard', 90]);
    const budget = spentOn([60, 30, 10]);
    const levels = rebalanceParty(old, testRoster, budget).heroes.map((slot) => slot.level);
    const [knight = 0, cleric = 0, guard = 0] = levels;

    expect(spentOn(levels)).toBeLessThanOrEqual(budget);
    expect(knight).toBeGreaterThan(cleric);
    expect(cleric).toBeGreaterThan(guard);
    expect(guard).toBeGreaterThan(1);
  });

  it('leaves a party alone when the coins cover it', () => {
    const party = partyOf(['knight', 10]);

    expect(rebalanceParty(party, testRoster, costToLevel(10))).toEqual(party);
  });
});

describe('upgradeSave', () => {
  it('turns a version 1 save into the current one at the same stage', () => {
    const current = newGame(testRoster, 'knight', 0, 3);
    const legacy = saveFromWire(
      JSON.parse(JSON.stringify({ ...current, version: 1, party: partyOf(['knight', 200]) })),
      testRoster,
    );
    const upgraded = legacy && upgradeSave(legacy, testRoster, levelCost(1) * 10);

    expect(upgraded?.version).toBe(current.version);
    expect(upgraded?.battle.stage).toBe(current.battle.stage);
    expect(upgraded?.party.heroes[0]?.level).toBeLessThan(200);
  });
});
