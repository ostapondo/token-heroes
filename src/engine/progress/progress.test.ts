import { describe, expect, it } from 'vitest';
import { BALANCE } from '../balance';
import { startStage } from '../battle/start';
import { partyOf, testRoster } from '../testing';
import { fastForward } from './offline';
import { newGame } from './save';
import { saveFromWire } from './save-wire';

const roundTrip = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

describe('fastForward', () => {
  it('stops at the offline cap', () => {
    const game = newGame(testRoster, 'knight', 0, 3);
    const { report } = fastForward(
      game.battle,
      BALANCE.offlineCapSeconds * 2,
      game.party,
      testRoster,
    );

    expect(report.seconds).toBe(BALANCE.offlineCapSeconds);
  });

  it('advances a strong party through several stages', () => {
    const party = partyOf(['knight', 120], ['cleric', 60]);
    const start = startStage(1, party, testRoster, { seed: 3, ultimate: 0 });
    const { battle, report } = fastForward(start, 120, party, testRoster);

    expect(report.stagesCleared).toBeGreaterThan(3);
    expect(battle.stage).toBeGreaterThan(4);
  });
});

describe('saveFromWire', () => {
  const game = newGame(testRoster, 'knight', 1_700_000_000_000, 9);

  it('accepts its own save after a JSON round trip', () => {
    expect(saveFromWire(roundTrip(game), testRoster)).toEqual(game);
  });

  it('rejects a save from another version', () => {
    expect(saveFromWire({ ...game, version: 2 }, testRoster)).toBeNull();
  });

  it('rejects a save that names a hero the roster lacks', () => {
    const stranger = { ...game, party: partyOf(['ghost', 3]) };

    expect(saveFromWire(roundTrip(stranger), testRoster)).toBeNull();
  });
});
