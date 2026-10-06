import { describe, expect, it } from 'vitest';
import { BALANCE } from '../balance';
import { partyPower } from '../party';
import { partyOf, testRoster } from '../testing';
import { chargeUltimate, strike, unleashUltimate } from './actions';
import { startStage } from './start';
import { BattleEventType } from '../types';

const party = partyOf(['knight', 10], ['cleric', 10]);
const battle = startStage(5, party, testRoster, { seed: 1, ultimate: 0 });

describe('strike', () => {
  it('hits the front foe for half the party power', () => {
    const { events } = strike(battle, party, testRoster);
    const amount = Math.ceil(partyPower(party, testRoster) * BALANCE.strikeShare);

    expect(events).toContainEqual({ type: BattleEventType.Strike, foe: 0, amount });
  });

  it('ignores a second strike inside the cooldown', () => {
    const first = strike(battle, party, testRoster);
    const second = strike(first.battle, party, testRoster);

    expect(second.events).toEqual([]);
  });
});

describe('ultimate', () => {
  it('does nothing until fully charged', () => {
    const halfway = chargeUltimate(battle, BALANCE.tokensPerUltimate / 2);

    expect(unleashUltimate(halfway, party, testRoster).events).toEqual([]);
  });

  it('caps the charge and spends all of it', () => {
    const charged = chargeUltimate(battle, BALANCE.tokensPerUltimate * 3);
    const unleashed = unleashUltimate(charged, party, testRoster);

    expect(charged.ultimate).toBe(1);
    expect(unleashed.events[0]?.type).toBe('ultimate');
    expect(unleashed.battle.ultimate).toBe(0);
  });
});
