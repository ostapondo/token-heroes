import { startStage } from '../battle/start';
import type { BattleState, PartyState, Roster } from '../types';

export const SAVE_VERSION = 1;

export interface GameSave {
  readonly version: typeof SAVE_VERSION;
  readonly battle: BattleState;
  readonly party: PartyState;
  readonly bestStage: number;
  readonly savedAt: number;
}

export function newGame(
  roster: Roster,
  starterHeroId: string,
  now: number,
  seed: number,
): GameSave {
  const party: PartyState = { heroes: [{ heroId: starterHeroId, level: 1 }] };

  return {
    version: SAVE_VERSION,
    battle: startStage(1, party, roster, { seed, ultimate: 0 }),
    party,
    bestStage: 1,
    savedAt: now,
  };
}

export function withProgress(
  save: GameSave,
  battle: BattleState,
  party: PartyState,
  now: number,
): GameSave {
  return {
    ...save,
    battle,
    party,
    bestStage: Math.max(save.bestStage, battle.stage),
    savedAt: now,
  };
}
