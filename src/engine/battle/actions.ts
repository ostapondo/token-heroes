import { BALANCE } from '../balance';
import { partyPower } from '../party';
import type { BattleEvent, BattleState, BattleStep, PartyState, Roster } from '../types';
import { damageFront, draftOf, settleClear } from './draft';

export function strike(battle: BattleState, party: PartyState, roster: Roster): BattleStep {
  if (battle.phase !== 'fighting' || battle.strikeReadyIn > 0) return { battle, events: [] };
  const draft = draftOf(battle);
  const events: BattleEvent[] = [];
  const amount = Math.ceil(partyPower(party, roster) * BALANCE.strikeShare);
  damageFront(draft, amount, events, (foe) => ({ type: 'strike', foe, amount }));
  draft.strikeReadyIn = BALANCE.strikeCooldown;
  settleClear(draft, events);
  return { battle: draft, events };
}

export function unleashUltimate(
  battle: BattleState,
  party: PartyState,
  roster: Roster,
): BattleStep {
  if (battle.phase !== 'fighting' || battle.ultimate < 1) return { battle, events: [] };
  const draft = draftOf(battle);
  const events: BattleEvent[] = [];
  const amount = Math.ceil(partyPower(party, roster) * BALANCE.ultimateMultiplier);
  damageFront(draft, amount, events, (foe) => ({ type: 'ultimate', foe, amount }));
  draft.ultimate = 0;
  settleClear(draft, events);
  return { battle: draft, events };
}

export function chargeUltimate(battle: BattleState, burnedTokens: number): BattleState {
  const ultimate = Math.min(1, battle.ultimate + burnedTokens / BALANCE.tokensPerUltimate);
  return { ...battle, ultimate };
}
