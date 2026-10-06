import { startStage } from '../battle/start';
import type { BattleState, PartyState, Roster } from '../types';
import { rebalanceParty } from './rebalance';

export const SAVE_VERSION = 2;
// Version 1 saves hold levels bought before heroes were designed from their place in the roster.
export const LEGACY_SAVE_VERSION = 1;

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

export interface StoredSave extends Omit<GameSave, 'version'> {
  readonly version: typeof SAVE_VERSION | typeof LEGACY_SAVE_VERSION;
}

export function upgradeSave(stored: StoredSave, roster: Roster, spent: number): GameSave {
  if (stored.version === SAVE_VERSION) return { ...stored, version: SAVE_VERSION };
  const party = rebalanceParty(stored.party, roster, spent);

  return {
    ...stored,
    version: SAVE_VERSION,
    party,
    battle: startStage(stored.battle.stage, party, roster, stored.battle),
  };
}
