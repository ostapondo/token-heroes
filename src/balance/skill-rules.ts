import { BALANCE, heroAttack, type Roster, skillHitPerCast } from '@engine';
import { compact, times } from './numbers';
import { stageReached, type PacePoint } from './pace';
import type { PaceRule } from './pace-rules';
import type { Rule } from './rules';

// Skills shape a hero's output without adding to it; a roster without them shows what they move.
const withoutSkills = (roster: Roster): Roster => ({
  ...roster,
  heroes: roster.heroes.map((hero) => ({ ...hero, skills: [] })),
});

function widestShift(points: readonly PacePoint[], roster: Roster) {
  const bare = withoutSkills(roster);

  return points
    .map((point) => ({
      coins: point.coins,
      shift: point.stage - stageReached(point.party, bare),
    }))
    .reduce((most, entry) => (Math.abs(entry.shift) > Math.abs(most.shift) ? entry : most), {
      coins: 0,
      shift: 0,
    });
}

export const SKILL_PACE_RULES: readonly PaceRule[] = [
  {
    id: 'skills-stand-out',
    statement: "A skill's first cast hits for at least three of its hero's own hits.",
    why: 'A crit already hits two and a half times as hard; a skill must stand out from it.',
    threshold: 3,
    judge({ roster }) {
      const level = BALANCE.skills.unlockLevel;
      const ratios = roster.heroes.flatMap((hero) =>
        hero.skills.flatMap((skill) => {
          const hit = skillHitPerCast(hero, skill, level);

          return hit === null ? [] : [{ id: skill.id, ratio: hit / heroAttack(hero, level) }];
        }),
      );
      const behind = ratios.filter((entry) => entry.ratio < this.threshold);

      return {
        passed: behind.length === 0,
        measured: Math.min(...ratios.map((entry) => entry.ratio)),
        detail: behind.length
          ? behind.map((entry) => `${entry.id} ${times(entry.ratio)}`).join(', ')
          : 'every skill outhits its hero',
      };
    },
  },
  {
    id: 'skills-are-fairly-priced',
    statement: 'Skills move the wall of the even and the best-upgrade player by at most 5 stages.',
    why:
      'A skill spends its hero’s budget, so it should reshape the fight, not win it; a skill ' +
      'that moves the wall is priced wrong, the way a guard was before it paid for healing.',
    threshold: 5,
    judge({ roster, steady, greedy }) {
      const most = [widestShift(steady, roster), widestShift(greedy, roster)].reduce(
        (left, right) => (Math.abs(right.shift) > Math.abs(left.shift) ? right : left),
      );

      return {
        passed: Math.abs(most.shift) <= this.threshold,
        measured: Math.abs(most.shift),
        detail: `skills move the wall by ${most.shift} stages at ${compact(most.coins)}`,
      };
    },
  },
];

export const SKILL_RULES: readonly Rule[] = [
  {
    id: 'skills-are-seen',
    statement:
      'Every hero with a skill casts it at least 3 times in the fight that stops the party.',
    why: 'A skill that fires once a fight is never seen; the wall fight is where the player looks.',
    threshold: 3,
    judge({ heroes, run }) {
      if (!run.frontier) return null;
      const casters = heroes.filter((sheet) => sheet.skills.some((skill) => skill.rank > 0));

      if (casters.length === 0) return null;
      const casts = casters.map((sheet) => ({
        id: sheet.heroId,
        casts: run.frontierCasts[sheet.heroId] ?? 0,
      }));
      const behind = casts.filter((entry) => entry.casts < this.threshold);

      return {
        passed: behind.length === 0,
        measured: Math.min(...casts.map((entry) => entry.casts)),
        detail: behind.length
          ? behind.map((entry) => `${entry.id} ${entry.casts}`).join(', ')
          : 'every skill is seen at the wall',
      };
    },
  },
];
