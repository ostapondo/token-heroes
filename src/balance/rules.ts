import { HeroRole } from '@engine';
import { percent, times } from './numbers';
import type { HeroSheet, StageSheet } from './sheets';
import type { RunReport } from './simulate';

export interface Situation {
  readonly heroes: readonly HeroSheet[];
  readonly run: RunReport;
  readonly frontier: StageSheet | null;
}

export interface Finding {
  readonly rule: string;
  readonly passed: boolean;
  readonly measured: number;
  readonly threshold: number;
  readonly detail: string;
}

export interface Rule {
  readonly id: string;
  readonly statement: string;
  readonly why: string;
  readonly threshold: number;
  judge(situation: Situation): Omit<Finding, 'rule' | 'threshold'> | null;
}

const sum = (sheets: readonly HeroSheet[], pick: (sheet: HeroSheet) => number) =>
  sheets.reduce((total, sheet) => total + pick(sheet), 0);
const ofRole = (sheets: readonly HeroSheet[], role: HeroRole) =>
  sheets.filter((sheet) => sheet.role === role);

function weakest(
  members: readonly HeroSheet[],
  share: (sheet: HeroSheet) => number,
  threshold: number,
  format: (share: number) => string = percent,
) {
  const shares = members.map((sheet) => ({ sheet, share: share(sheet) }));
  const measured = Math.min(...shares.map((entry) => entry.share));
  const behind = shares.filter((entry) => entry.share < threshold);

  return {
    passed: behind.length === 0,
    measured,
    behind: behind.map((entry) => `${entry.sheet.heroId} ${format(entry.share)}`).join(', '),
  };
}

export const RULES: readonly Rule[] = [
  {
    id: 'healers-keep-up',
    statement: "The party's healers undo at least 20% of the foes' damage.",
    why: 'A healer trades its whole damage for healing; below this it is dead weight.',
    threshold: 0.2,
    judge({ heroes }) {
      const healers = ofRole(heroes, HeroRole.Healer);

      if (healers.length === 0) return null;
      const measured = sum(healers, (sheet) => sheet.mend);

      return {
        passed: measured >= this.threshold,
        measured,
        detail: `healing undoes ${percent(measured)} of the foes' damage`,
      };
    },
  },
  {
    id: 'bosses-still-threaten',
    statement: "The party's healers undo at most 60% of the foes' damage.",
    why: 'Healing that undoes nearly every hit leaves tanks pointless and fights endless.',
    threshold: 0.6,
    judge({ heroes }) {
      const healers = ofRole(heroes, HeroRole.Healer);

      if (healers.length === 0) return null;
      const measured = sum(healers, (sheet) => sheet.mend);

      return {
        passed: measured <= this.threshold,
        measured,
        detail: `healing undoes ${percent(measured)} of the foes' damage`,
      };
    },
  },
  {
    id: 'wall-fights-take-time',
    statement: 'The fight that stops the party lasts 15 seconds or longer.',
    why: 'A boss may test toughness by hitting hard, never by ending the fight before it starts.',
    threshold: 15,
    judge({ run }) {
      if (!run.frontier) return null;
      const measured = run.frontier.secondsSurvived;

      return {
        passed: measured >= this.threshold,
        measured,
        detail: `the party lasts ${measured.toFixed(1)} s at stage ${run.frontier.stage}`,
      };
    },
  },
  {
    id: 'wall-fights-end',
    statement: 'The fight that stops the party lasts at most 3 minutes.',
    why: 'With no timer, a boss that neither falls nor wins makes the screen stand still.',
    threshold: 180,
    judge({ run }) {
      if (!run.frontier) return null;
      const measured = run.frontier.secondsSurvived;

      return {
        passed: measured <= this.threshold,
        measured,
        detail: `the party lasts ${measured.toFixed(1)} s at stage ${run.frontier.stage}`,
      };
    },
  },
  {
    id: 'bosses-are-the-wall',
    statement: 'The party gets stuck on a boss, never on a pack.',
    why: 'Packs set the pace between bosses; a pack that stops the party feels like a bug.',
    threshold: 1,
    judge({ frontier }) {
      if (!frontier) return null;

      return {
        passed: frontier.boss,
        measured: frontier.boss ? 1 : 0,
        detail: `stuck at stage ${frontier.stage}, ${frontier.boss ? 'a boss' : 'a pack'}`,
      };
    },
  },
  {
    id: 'strikers-pull-weight',
    statement: "Every striker deals at least 5% of the party's damage.",
    why: 'A striker who barely scratches the foe is a hire nobody should make.',
    threshold: 0.05,
    judge({ heroes }) {
      const strikers = ofRole(heroes, HeroRole.Striker);
      const total = sum(heroes, (sheet) => sheet.damagePerSecond);

      if (strikers.length < 2 || total === 0) return null;
      const result = weakest(strikers, (sheet) => sheet.damagePerSecond / total, this.threshold);

      return { ...result, detail: result.behind || 'every striker carries its share' };
    },
  },
  {
    id: 'tanks-hold-the-line',
    statement: 'Every tank holds at least twice the health of an average striker or healer.',
    why:
      'A tank gives up damage for health; it must be far tougher than the heroes it shields. ' +
      'It is measured against them, not the whole party, so other tanks do not count against it.',
    threshold: 2,
    judge({ heroes }) {
      const tanks = ofRole(heroes, HeroRole.Tank);
      const shielded = heroes.filter((sheet) => sheet.role !== HeroRole.Tank);

      if (tanks.length === 0 || shielded.length === 0) return null;
      const average = sum(shielded, (sheet) => sheet.hp) / shielded.length;
      const result = weakest(tanks, (sheet) => sheet.hp / average, this.threshold, times);

      return { ...result, detail: result.behind || 'every tank holds its share' };
    },
  },
  {
    id: 'no-wipes-before-the-wall',
    statement: 'The party wipes at most once on the stages it goes on to clear.',
    why: 'Wipes below the wall mean a stage is spikier than the ones around it.',
    threshold: 1,
    judge({ run }) {
      return {
        passed: run.wipesBeforeFrontier <= this.threshold,
        measured: run.wipesBeforeFrontier,
        detail: `${run.wipesBeforeFrontier} wipes over ${run.stagesCleared} cleared stages`,
      };
    },
  },
];

export function judge(situation: Situation, extra: readonly Rule[] = []): Finding[] {
  return [...RULES, ...extra].flatMap((rule) => {
    const verdict = rule.judge(situation);

    return verdict ? [{ rule: rule.id, threshold: rule.threshold, ...verdict }] : [];
  });
}
