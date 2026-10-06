import { BALANCE } from '../balance';
import { safeAmount } from '../formulas';
import { partyPower, strikeDamage } from '../party';
import {
  type BattleEvent,
  BattleEventType,
  BattlePhase,
  type BattleState,
  type BattleStep,
  type PartyState,
  type Roster,
} from '../types';
import { damageFront, draftOf, settleClear } from './draft';

export function strike(battle: BattleState, party: PartyState, roster: Roster): BattleStep {
  if (battle.phase !== BattlePhase.Fighting || battle.strikeReadyIn > 0)
    return { battle, events: [] };
  const draft = draftOf(battle);
  const events: BattleEvent[] = [];
  const amount = strikeDamage(party, roster);

  damageFront(draft, amount, events, (foe) => ({ type: BattleEventType.Strike, foe, amount }));
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
  const amount = safeAmount(partyPower(party, roster) * BALANCE.ultimateMultiplier);

  damageFront(draft, amount, events, (foe) => ({ type: BattleEventType.Ultimate, foe, amount }));
  draft.ultimate = 0;
  settleClear(draft, events);

  return { battle: draft, events };
}

export function chargeUltimate(battle: BattleState, burnedTokens: number): BattleState {
  const ultimate = Math.min(1, battle.ultimate + burnedTokens / BALANCE.tokensPerUltimate);

  return { ...battle, ultimate };
}
