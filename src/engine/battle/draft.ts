import { BALANCE } from '../balance';
import {
  type BattleEvent,
  BattleEventType,
  BattlePhase,
  type BattleState,
  type Foe,
} from '../types';

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

type FoeDraft = Mutable<Foe>;

export interface BattleDraft extends Omit<Mutable<BattleState>, 'foes' | 'cooldowns'> {
  foes: FoeDraft[];
  cooldowns: Record<string, number>;
}

export function draftOf(battle: BattleState): BattleDraft {
  return {
    ...battle,
    foes: battle.foes.map((foe) => ({ ...foe })),
    cooldowns: { ...battle.cooldowns },
  };
}

export function frontFoe(draft: BattleDraft): number {
  return draft.foes.findIndex((foe) => foe.hp > 0);
}

export function damageFront(
  draft: BattleDraft,
  amount: number,
  events: BattleEvent[],
  hitEvent: (foe: number) => BattleEvent,
): void {
  const index = frontFoe(draft);
  const foe = draft.foes[index];

  if (!foe) return;
  foe.hp = Math.max(0, foe.hp - amount);
  events.push(hitEvent(index));
  if (foe.hp === 0) events.push({ type: BattleEventType.FoeDefeated, foe: index, boss: foe.boss });
}

export function settleClear(draft: BattleDraft, events: BattleEvent[]): boolean {
  if (frontFoe(draft) !== -1) return false;
  draft.phase = BattlePhase.Cleared;
  draft.phaseLeft = BALANCE.advanceDelay;
  events.push({ type: BattleEventType.StageCleared, stage: draft.stage });

  return true;
}

export function foesDamagePerSecond(draft: BattleDraft): number {
  return draft.foes.reduce(
    (sum, foe) => (foe.hp > 0 ? sum + foe.damage / foe.attackInterval : sum),
    0,
  );
}

export function wipe(draft: BattleDraft, events: BattleEvent[]): void {
  draft.phase = BattlePhase.Wiped;
  draft.phaseLeft = BALANCE.respawnDelay;
  draft.partyHp = 0;
  events.push({ type: BattleEventType.Wiped });
}
