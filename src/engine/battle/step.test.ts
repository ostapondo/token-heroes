import { describe, expect, it } from 'vitest';
import { partyMaxHp } from '../party';
import { partyOf, runFor, testRoster } from '../testing';
import { startStage } from './start';
import { BattleEventType } from '../types';

const fresh = { seed: 7, ultimate: 0 };

describe('stepBattle', () => {
  it('clears a pack and starts the next stage after the advance delay', () => {
    const party = partyOf(['knight', 200]);
    const { events } = runFor(startStage(1, party, testRoster, fresh), 10, party);
    const cleared = events.findIndex((event) => event.type === BattleEventType.StageCleared);
    const started = events.findIndex((event) => event.type === BattleEventType.StageStarted);

    expect(cleared).toBeGreaterThanOrEqual(0);
    expect(started).toBeGreaterThan(cleared);
    expect(events[started]).toEqual({ type: BattleEventType.StageStarted, stage: 2 });
  });

  it('wipes a weak party on a boss and retries the same stage after the respawn delay', () => {
    const party = partyOf(['knight', 1]);
    const lost = runFor(startStage(50, party, testRoster, fresh), 40, party);

    expect(lost.events).toContainEqual({ type: BattleEventType.Wiped });
    expect(lost.events).toContainEqual({ type: BattleEventType.Respawned, stage: 50 });
    expect(lost.battle.stage).toBe(50);
  });

  it('fights a boss until one side falls, however long that takes', () => {
    const party = partyOf(['guard', 3]);
    const { events } = runFor(startStage(5, party, testRoster, fresh), 120, party);

    expect(events).toContainEqual({ type: BattleEventType.StageCleared, stage: 5 });
    expect(events.some((event) => event.type === BattleEventType.Wiped)).toBe(false);
  });

  it('never heals the party above its maximum', () => {
    const party = partyOf(['cleric', 40], ['guard', 20]);
    const result = runFor(startStage(3, party, testRoster, fresh), 10, party);

    expect(result.events.some((event) => event.type === BattleEventType.Heal)).toBe(true);
    expect(result.battle.partyHp).toBeLessThanOrEqual(partyMaxHp(party, testRoster));
  });

  it('plays out the same way for the same seed', () => {
    const party = partyOf(['knight', 30], ['cleric', 10]);
    const first = runFor(startStage(4, party, testRoster, fresh), 20, party);
    const second = runFor(startStage(4, party, testRoster, fresh), 20, party);

    expect(second).toEqual(first);
  });
});
