import { describe, expect, it } from 'vitest';
import { BALANCE } from '../balance';
import { partyMaxHp } from '../party';
import { partyOf, runFor, testRoster } from '../testing';
import { startStage } from './start';
import { BattleEventType, BattlePhase, WipeReason } from '../types';

const fresh = { seed: 7, ultimate: 0 };

describe('stepBattle', () => {
  it('clears a pack and starts the next stage after the advance delay', () => {
    const party = partyOf(['knight', 200]);
    const cleared = runFor(startStage(1, party, testRoster, fresh), 10, party);

    expect(cleared.events.some((event) => event.type === BattleEventType.StageCleared)).toBe(true);
    expect(cleared.battle.stage).toBe(2);
    expect(cleared.events).toContainEqual({ type: BattleEventType.StageStarted, stage: 2 });
  });

  it('wipes a weak party on a boss and retries the same stage after the respawn delay', () => {
    const party = partyOf(['knight', 1]);
    const lost = runFor(startStage(5, party, testRoster, fresh), 40, party);

    expect(lost.events).toContainEqual({ type: BattleEventType.Wiped, reason: WipeReason.Defeat });
    expect(lost.events).toContainEqual({ type: BattleEventType.Respawned, stage: 5 });
    expect(lost.battle.stage).toBe(5);
  });

  it('wipes on the boss timer when the party outlives the boss', () => {
    const party = partyOf(['guard', 3]);
    const result = runFor(
      startStage(5, party, testRoster, fresh),
      BALANCE.bossTimeLimit + 1,
      party,
    );

    expect(result.events).toContainEqual({
      type: BattleEventType.Wiped,
      reason: WipeReason.Timeout,
    });
    expect(result.battle.phase).toBe(BattlePhase.Wiped);
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
