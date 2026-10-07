import { type Content, skillsOf } from '@content';
import {
  BALANCE,
  formTier,
  type HeroStats,
  levelOfRank,
  skillHitPerCast,
  skillRank,
} from '@engine';
import type { SkillChip, SkillGoal, SkillMark } from '../types';

const MILESTONE = BALANCE.milestoneEvery;

// A hero's skills as the party panel shows them, the hit scaled by the party's ascension power.
export function skillChips(
  hero: HeroStats,
  level: number,
  content: Content,
  power = 1,
): SkillChip[] {
  const defs = skillsOf(content, hero.id);

  return defs.map((def) => {
    const stats = hero.skills.find((skill) => skill.id === def.id);
    const lag = stats?.lag ?? 0;
    const rank = skillRank(level, lag);
    const hit = stats
      ? skillHitPerCast(hero, stats, Math.max(level, BALANCE.skills.unlockLevel))
      : null;

    return {
      id: def.id,
      name: formTier(rank) === 2 ? def.evolved : def.name,
      evolved: def.evolved,
      rank,
      tier: formTier(rank),
      locked: rank === 0,
      color: def.color,
      icon: def.icon,
      trigger: def.trigger,
      cooldown: def.cooldown ?? null,
      chance: def.chance ?? null,
      charge: def.charge ?? null,
      effects: def.effects,
      hit: hit === null ? null : Math.round(hit * power),
      nextRankAt: levelOfRank(rank + 1, lag),
      evolvesAt: rank < 5 ? levelOfRank(5, lag) : null,
    };
  });
}

// The nearest skill rank ahead, which the panel names beside the next ×4.
export function nextSkillGoal(chips: readonly SkillChip[], level: number): SkillGoal | null {
  const [nearest] = chips.toSorted((left, right) => left.nextRankAt - right.nextRankAt);

  if (!nearest) return null;
  const rank = nearest.rank + 1;

  return {
    name: rank >= 5 && nearest.rank < 5 ? nearest.evolved : nearest.name,
    rank,
    opens: nearest.locked,
    levels: nearest.nextRankAt - level,
  };
}

// Ranks still to come before the next ×4, as places along the bar that leads to it.
export function skillMarks(chips: readonly SkillChip[], level: number): SkillMark[] {
  const start = Math.floor(level / MILESTONE) * MILESTONE;

  return chips.flatMap((chip) => {
    const marks: SkillMark[] = [];

    for (let rank = chip.rank + 1, at = chip.nextRankAt; at <= start + MILESTONE; rank += 1) {
      marks.push({ at: (at - start) / MILESTONE, color: chip.color, evolves: rank === 5 });
      at += BALANCE.skills.rankEvery;
    }

    return marks;
  });
}
