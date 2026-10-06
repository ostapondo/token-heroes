import { ultimateDamage } from '@engine';
import { compact, percent } from './numbers';
import type { PaceRule } from './pace-rules';
import { stageSheet } from './sheets';
import { runParty } from './simulate';

const ACTIVE_POINTS = [1e7, 3e8, 3.6e9];
// Two strikes a second is a player clicking along while they watch, not a macro.
const STRIKES_PER_SECOND = 2;

function widest(gaps: readonly { coins: number; gap: number }[]) {
  return gaps.reduce((most, entry) => (entry.gap > most.gap ? entry : most), {
    coins: 0,
    gap: -Infinity,
  });
}

export const PLAY_RULES: readonly PaceRule[] = [
  {
    id: 'no-dominant-strategy',
    statement: 'A player who always buys the best upgrade stays within 15 stages of an even one.',
    why: 'If one way to spend coins wins by far, every player is pushed into it.',
    threshold: 15,
    judge({ steady, greedy }) {
      const gaps = steady.map((point, index) => ({
        coins: point.coins,
        gap: (greedy[index]?.stage ?? point.stage) - point.stage,
      }));
      const most = widest(gaps);

      return {
        passed: most.gap <= this.threshold,
        measured: most.gap,
        detail: `best-upgrade play leads by ${most.gap} stages at ${compact(most.coins)}`,
      };
    },
  },
  {
    id: 'active-play-is-a-bonus',
    statement:
      'Clicking along twice a second gains at most 15 stages over letting the party fight.',
    why: 'Watching and clicking should pay, but burned tokens must stay the way forward.',
    threshold: 15,
    judge({ steady, roster }) {
      const gaps = steady
        .filter((point) => ACTIVE_POINTS.includes(point.coins))
        .map((point) => {
          const run = runParty(point.party, roster, { strikesPerSecond: STRIKES_PER_SECOND });
          const active = run.frontier?.stage ?? run.fromStage + run.stagesCleared;

          return { coins: point.coins, gap: active - point.stage };
        });
      const most = widest(gaps);

      return {
        passed: most.gap <= this.threshold,
        measured: most.gap,
        detail: `clicking gains ${most.gap} stages at ${compact(most.coins)} tokens`,
      };
    },
  },
  {
    id: 'ultimate-is-a-boost',
    statement:
      'One ultimate takes at most a quarter of the health of the boss that stops the party.',
    why: 'An ultimate should rescue a close fight, never skip the wall.',
    threshold: 0.25,
    judge({ steady, roster }) {
      const shares = steady.map((point) => ({
        coins: point.coins,
        gap: ultimateDamage(point.party, roster) / stageSheet(roster, point.stage).totalHp,
      }));
      const most = widest(shares);

      return {
        passed: most.gap <= this.threshold,
        measured: most.gap,
        detail: `an ultimate takes ${percent(most.gap)} of the wall boss at ${compact(most.coins)}`,
      };
    },
  },
];
