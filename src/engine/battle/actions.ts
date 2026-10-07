import { BALANCE } from '../balance';
import { strikeDamage, ultimateDamage } from '../party';
import {
  type BattleEvent,
  BattleEventType,
  BattlePhase,
  type BattleState,
  type BattleStep,
  type PartyState,
  type Roster,
} from '../types';
import { draftOf, settleClear } from './draft';
import { damageFront } from './mechanics';

export function strike(battle: BattleState, party: PartyState, roster: Roster): BattleStep {
  if (battle.phase !== BattlePhase.Fighting || battle.strikeReadyIn > 0)
    return { battle, events: [] };
  const draft = draftOf(battle);
  const events: BattleEvent[] = [];
  const amount = strikeDamage(party, roster);

  damageFront(draft, amount, events, (foe, landed) => ({
    type: BattleEventType.Strike,
    foe,
    amount: landed,
  }));
  draft.strikeReadyIn = BALANCE.strikeCooldown;
  settleClear(draft, events);

  return { battle: draft, events };
}

export function unleashUltimate(
  battle: BattleState,
  party: PartyState,
  roster: Roster,
): BattleStep {
  if (battle.phase !== BattlePhase.Fighting || battle.ultimate < 1) return { battle, events: [] };
  const draft = draftOf(battle);
  const events: BattleEvent[] = [];
  const amount = ultimateDamage(party, roster);

  damageFront(draft, amount, events, (foe, landed) => ({
    type: BattleEventType.Ultimate,
    foe,
    amount: landed,
  }));
  draft.ultimate = 0;
  settleClear(draft, events);

  return { battle: draft, events };
}

export function chargeUltimate(battle: BattleState, burnedTokens: number): BattleState {
  const ultimate = Math.min(1, battle.ultimate + burnedTokens / BALANCE.tokensPerUltimate);

  return { ...battle, ultimate };
}
