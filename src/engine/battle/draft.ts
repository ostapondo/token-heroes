import { BALANCE } from '../balance';
import type { SkillState } from '../skills/types';
import {
  type BattleEvent,
  BattleEventType,
  BattlePhase,
  type BattleState,
  type Foe,
} from '../types';

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

export type FoeDraft = Mutable<Foe>;

export interface BattleDraft extends Omit<Mutable<BattleState>, 'foes' | 'cooldowns' | 'skills'> {
  foes: FoeDraft[];
  cooldowns: Record<string, number>;
  skills: Record<string, SkillState>;
}

export function draftOf(battle: BattleState): BattleDraft {
  return {
    ...battle,
    foes: battle.foes.map((foe) => ({ ...foe })),
    cooldowns: { ...battle.cooldowns },
    skills: { ...battle.skills },
  };
}

export function frontFoe(draft: BattleDraft): number {
  return draft.foes.findIndex((foe) => foe.hp > 0);
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
