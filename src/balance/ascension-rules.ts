import { BALANCE, costToLevel, type PartyState, type Roster } from '@engine';
import { compact, percent } from './numbers';
import { partyFor, stageReached, type PacePoint } from './pace';
import type { PaceRule } from './pace-rules';

const SEARCH_STEPS = 40;
const LATER = 10;

const atTheWall = (steady: readonly PacePoint[]) =>
  steady.filter((point) => point.stage >= BALANCE.ascension.minStage);

// The party after ascending at a stage and spending coins anew: the same heroes, levelled
// together as far as the coins go.
function rebuilt(party: PartyState, coins: number, renown: number): PartyState {
  let level = 1;

  while (party.heroes.length * costToLevel(level + 1) <= coins) level += 1;

  return { heroes: party.heroes.map((slot) => ({ ...slot, level })), renown };
}

function coinsToReturn(party: PartyState, roster: Roster, wall: number): number {
  let low = 0;
  let high = Math.log10(party.heroes.length * costToLevel(1_000));

  for (let step = 0; step < SEARCH_STEPS; step += 1) {
    const middle = (low + high) / 2;

    if (stageReached(rebuilt(party, 10 ** middle, wall), roster) >= wall) high = middle;
    else low = middle;
  }

  return 10 ** high;
}

export const ASCENSION_RULES: readonly PaceRule[] = [
  {
    id: 'ascension-pays-back',
    statement: 'After ascending at the wall, half the tokens it took to get there win it back.',
    why: 'Ascension takes every level away; its power has to return them well before it hurts.',
    threshold: 0.5,
    judge({ steady, roster }) {
      const shares = atTheWall(steady).map((point) => ({
        coins: point.coins,
        share: coinsToReturn(point.party, roster, point.stage) / point.coins,
      }));
      const most = shares.reduce((high, entry) => (entry.share > high.share ? entry : high), {
        coins: 0,
        share: 0,
      });

      return {
        passed: most.share <= this.threshold,
        measured: most.share,
        detail: `winning back costs ${percent(most.share)} of the burn at ${compact(most.coins)}`,
      };
    },
  },
  {
    id: 'ascension-pays-off',
    statement:
      'With ten times the tokens, a party that ascended is 5+ stages past one that did not.',
    why: 'Starting over must leave the player ahead in the long run, or nobody should do it.',
    threshold: 5,
    judge({ steady, roster }) {
      const leads = atTheWall(steady).map((point) => {
        const later = point.coins * LATER;
        const ascended = rebuilt(point.party, later - point.coins, point.stage);
        const stayed = partyFor(roster, later);

        return {
          coins: point.coins,
          lead: stageReached(ascended, roster) - stageReached(stayed, roster),
        };
      });
      const least = leads.reduce((low, entry) => (entry.lead < low.lead ? entry : low), {
        coins: 0,
        lead: Infinity,
      });

      return {
        passed: least.lead >= this.threshold,
        measured: least.lead,
        detail: `ascending leads by ${least.lead} stages, ten times ${compact(least.coins)} later`,
      };
    },
  },
];
