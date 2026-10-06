import { BALANCE } from '../balance';
import { stepBattle } from '../battle/step';
import { BattleEventType, type BattleState, type PartyState, type Roster } from '../types';

export interface OfflineReport {
  readonly seconds: number;
  readonly stagesCleared: number;
  readonly wipes: number;
}

export interface OfflineResult {
  readonly battle: BattleState;
  readonly report: OfflineReport;
}

export function fastForward(
  battle: BattleState,
  seconds: number,
  party: PartyState,
  roster: Roster,
): OfflineResult {
  const total = Math.min(Math.max(seconds, 0), BALANCE.offlineCapSeconds);
  let current = battle;
  let stagesCleared = 0;
  let wipes = 0;

  for (let elapsed = 0; elapsed < total; elapsed += BALANCE.offlineStepSeconds) {
    const dt = Math.min(BALANCE.offlineStepSeconds, total - elapsed);
    const step = stepBattle(current, dt, party, roster);

    current = step.battle;
    for (const event of step.events) {
      if (event.type === BattleEventType.StageCleared) stagesCleared += 1;
      if (event.type === BattleEventType.Wiped) wipes += 1;
    }
  }

  return { battle: current, report: { seconds: total, stagesCleared, wipes } };
}
