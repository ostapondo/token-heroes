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
import { damageAt, damageFront } from './mechanics';

const struck = (foe: number, amount: number): BattleEvent => ({
  type: BattleEventType.Strike,
  foe,
  amount,
});

// A tap strikes the foe the player aimed at, or the front foe when it names none that stands.
export function strike(
  battle: BattleState,
  party: PartyState,
  roster: Roster,
  aimed?: number,
): BattleStep {
  if (battle.phase !== BattlePhase.Fighting || battle.strikeReadyIn > 0)
    return { battle, events: [] };
  const draft = draftOf(battle);
  const events: BattleEvent[] = [];
  const amount = strikeDamage(party, roster);

  if (aimed !== undefined && (draft.foes[aimed]?.hp ?? 0) > 0)
    damageAt(draft, aimed, amount, events, (foe, landed) => events.push(struck(foe, landed)));
  else damageFront(draft, amount, events, struck);
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
