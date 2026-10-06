import { BALANCE, heroDamage, heroHp, type Roster } from '@engine';
import { compact } from './numbers';
import { outputPerCoin, type PacePoint } from './pace';
import type { Finding } from './rules';

interface PaceContext {
  readonly roster: Roster;
  readonly steady: readonly PacePoint[];
  readonly greedy: readonly PacePoint[];
}

export interface PaceRule {
  readonly id: string;
  readonly statement: string;
  readonly why: string;
  readonly threshold: number;
  judge(context: PaceContext): Omit<Finding, 'rule' | 'threshold'>;
}

const stageAt = (curve: readonly PacePoint[], coins: number): number =>
  curve.find((point) => point.coins === coins)?.stage ?? 0;

function window(coins: number, from: number, to: number) {
  return ({ steady }: PaceContext) => {
    const stage = stageAt(steady, coins);

    return {
      passed: stage >= from && stage <= to,
      measured: stage,
      detail: `${compact(coins)} burned tokens reach stage ${stage}; aim for ${from}–${to}`,
    };
  };
}

// Damage and toughness weighed against the role's own template, so focus moves a hero's
// strength between the two without changing its worth.
function worth(roster: Roster, heroId: string, coins: number): number {
  const { hero, level } = outputPerCoin(roster, heroId, coins);
  const role = BALANCE.roles[hero.role];
  const growth = heroHp({ ...hero, baseHp: 1 }, level);
  const offence =
    hero.baseDamage > 0
      ? heroDamage(hero, level) / hero.attackInterval / role.damagePerSecond
      : hero.power * growth;

  return offence + heroHp(hero, level) / role.hp;
}

// Heroes are compared on a budget large enough that the later hero's hire price is a tenth of it.
const UPGRADE_BUDGET = 1e9;
const HIRE_TO_BUDGET = 10;

export const PACE_RULES: readonly PaceRule[] = [
  {
    id: 'first-hour-feels-fast',
    statement: 'A million burned tokens, about an hour of work, reach stage 15 to 35.',
    why: 'The first session should show the game moving with every reply an agent writes.',
    threshold: 15,
    judge: window(1e6, 15, 35),
  },
  {
    id: 'first-day-reaches-mid-game',
    statement: 'Ten million burned tokens, about a day of work, reach stage 40 to 60.',
    why: 'After a day the player has met most bosses and the economy starts to matter.',
    threshold: 40,
    judge: window(1e7, 40, 60),
  },
  {
    id: 'first-month-reaches-stage-100',
    statement: 'Three hundred million burned tokens, about a month, reach stage 90 to 120.',
    why: 'A month of steady work should feel like a milestone, not a wall.',
    threshold: 90,
    judge: window(3e8, 90, 120),
  },
  {
    id: 'progress-never-stalls',
    statement: 'Ten times more burned tokens late in the game still buy at least 35 stages.',
    why: 'Each stage may cost a little more than the last, never so much that progress stops.',
    threshold: 35,
    judge({ steady }) {
      const gained = stageAt(steady, 3.6e10) - stageAt(steady, 3.6e9);

      return {
        passed: gained >= this.threshold,
        measured: gained,
        detail: `going from 3.6B to 36B burned tokens gains ${gained} stages`,
      };
    },
  },
  {
    id: 'rarer-heroes-are-upgrades',
    statement: 'Every hero is worth at least 5% more per coin than the hero before it.',
    why: 'A hero the player waits weeks to unlock has to be worth the wait.',
    threshold: 1.05,
    judge({ roster }) {
      const steps = roster.heroes.slice(1).map((hero, index) => {
        const before = roster.heroes[index] ?? hero;
        const coins = Math.max(UPGRADE_BUDGET, hero.hireCost * HIRE_TO_BUDGET);

        return {
          id: hero.id,
          step: worth(roster, hero.id, coins) / worth(roster, before.id, coins),
        };
      });
      const behind = steps.filter((entry) => entry.step < this.threshold);

      return {
        passed: behind.length === 0,
        measured: Math.min(...steps.map((entry) => entry.step)),
        detail: behind.length
          ? behind.map((entry) => `${entry.id} ×${entry.step.toFixed(2)}`).join(', ')
          : 'every hero beats the one before it',
      };
    },
  },
];
