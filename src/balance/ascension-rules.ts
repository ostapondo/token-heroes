import { BALANCE, type PartyState, type Roster } from '@engine';
import { compact } from './numbers';
import { stageReached, type PacePoint } from './pace';
import type { PaceRule } from './pace-rules';

const MAX_ASCENSIONS = 30;

const deepEnough = (steady: readonly PacePoint[]) =>
  steady.filter((point) => point.stage >= BALANCE.ascension.minStage);

const ascended = (party: PartyState, renown: number): PartyState => ({ ...party, renown });

// Ascends every time the party gets deep enough, with no new tokens, until it stops gaining.
function ascendUntilDry(party: PartyState, roster: Roster, wall: number): number {
  let best = wall;

  for (let ascension = 0; ascension < MAX_ASCENSIONS; ascension += 1) {
    const reached = stageReached(ascended(party, best), roster);

    if (reached < best + BALANCE.ascension.minGain) break;
    best = reached;
  }

  return best - wall;
}

export const ASCENSION_RULES: readonly PaceRule[] = [
  {
    id: 'ascension-pays-at-the-wall',
    statement: 'Ascending at the wall carries the party at least 5 stages past it.',
    why: 'A player who is stuck should find a reason to stay, not a button that does nothing.',
    threshold: 5,
    judge({ steady, roster }) {
      const gains = deepEnough(steady).map((point) => ({
        coins: point.coins,
        gain: stageReached(ascended(point.party, point.stage), roster) - point.stage,
      }));
      const least = gains.reduce((low, entry) => (entry.gain < low.gain ? entry : low), {
        coins: 0,
        gain: Infinity,
      });

      return {
        passed: least.gain >= this.threshold,
        measured: least.gain,
        detail: `ascending at the wall gains ${least.gain} stages at ${compact(least.coins)}`,
      };
    },
  },
  {
    id: 'ascension-runs-dry',
    statement: 'Ascending again and again without new tokens gains at most 25 stages in all.',
    why: 'Burned tokens stay the way forward; ascension only shakes a stuck party loose.',
    threshold: 25,
    judge({ steady, roster }) {
      const gains = deepEnough(steady).map((point) => ({
        coins: point.coins,
        gain: ascendUntilDry(point.party, roster, point.stage),
      }));
      const most = gains.reduce((high, entry) => (entry.gain > high.gain ? entry : high), {
        coins: 0,
        gain: 0,
      });

      return {
        passed: most.gain <= this.threshold,
        measured: most.gain,
        detail: `endless ascending gains ${most.gain} stages at ${compact(most.coins)}`,
      };
    },
  },
];
