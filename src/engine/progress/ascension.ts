import { BALANCE } from '../balance';
import { startStage } from '../battle/start';
import { renownPower } from '../party';
import type { Roster } from '../types';
import type { GameSave } from './save';

export interface AscensionOffer {
  readonly available: boolean;
  readonly power: number;
  readonly nextPower: number;
}

export function nextAscensionStage(renown: number): number {
  const { minStage, depthStep } = BALANCE.ascension;

  return Math.max(minStage, Math.ceil(renown * depthStep));
}

// The party may ascend once it is a quarter deeper than where it last ascended.
export function ascensionOffer(save: GameSave): AscensionOffer {
  const renown = save.party.renown ?? 0;

  return {
    available: save.bestStage >= nextAscensionStage(renown),
    power: renownPower(renown),
    nextPower: renownPower(Math.max(renown, save.bestStage)),
  };
}

export function ascend(save: GameSave, roster: Roster, now: number): GameSave {
  if (!ascensionOffer(save).available) return save;
  const party = { ...save.party, renown: save.bestStage };

  return {
    ...save,
    party,
    battle: startStage(1, party, roster, {
      seed: save.battle.seed,
      ultimate: save.battle.ultimate,
    }),
    savedAt: now,
  };
}
