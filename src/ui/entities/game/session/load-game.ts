import {
  fastForward,
  newGame,
  saveFromWire,
  withProgress,
  type GameSave,
  type Roster,
} from '@engine';
import { LogLevel, type Host } from '@platform';
import { SEED_RANGE } from '../constants';

export interface LoadedGame {
  readonly game: GameSave;
  readonly stagesCleared: number;
}

export async function loadGame(
  host: Host,
  roster: Roster,
  starterHeroId: string,
  now: number,
): Promise<LoadedGame> {
  const stored = await host.loadSave();
  const saved = stored === null ? null : saveFromWire(stored, roster);

  if (stored !== null && !saved) {
    host.log(LogLevel.Warn, 'The stored save failed validation; a new game starts');
  }
  if (!saved) {
    const seed = Math.floor(Math.random() * SEED_RANGE);

    return { game: newGame(roster, starterHeroId, now, seed), stagesCleared: 0 };
  }

  const awaySeconds = Math.max(0, (now - saved.savedAt) / 1000);
  const { battle, report } = fastForward(saved.battle, awaySeconds, saved.party, roster);

  return {
    game: withProgress(saved, battle, saved.party, now),
    stagesCleared: report.stagesCleared,
  };
}
