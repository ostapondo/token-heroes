import { BALANCE } from '../balance';
import { type BattleDraft, foesDamagePerSecond, frontFoe } from '../battle/draft';
import type { BattleState, HeroStats, PartyState, Roster } from '../types';
import { heldRate, skillRate } from './budget';
import { charging, type Context, fire, isLive, membersOf, rolled, stateOf } from './firing';
import { skillRank } from './ranks';
import { type SkillState, SkillTrigger } from './types';

const GOLDEN_RATIO = 0.618_034;

// The first casts are spread by the golden ratio, so the party's skills never fire all at once.
// Skills carry their timers and budget from stage to stage; a boss fight brings each timer
// forward to its place early in the fight, keeping the budget.
export function freshSkills(
  party: PartyState,
  roster: Roster,
  carried: BattleState['skills'],
  boss: boolean,
): Record<string, SkillState> {
  const skills = membersOf(party, roster).flatMap((member) => member.hero.skills);
  const { firstCast, bossOpening } = BALANCE.skills;

  return Object.fromEntries(
    skills.map((skill, index) => {
      const spread = (firstCast + index * GOLDEN_RATIO) % 1;
      const cooldown = skill.cooldown ?? 0;
      const kept = carried?.[skill.id];
      const opening = cooldown * bossOpening * spread;

      return [
        skill.id,
        kept
          ? { ...kept, readyIn: boss ? Math.min(kept.readyIn, opening) : kept.readyIn }
          : { readyIn: cooldown * spread, pool: 0, misses: 0 },
      ];
    }),
  );
}

// A hero holds its own attack while one of its open skills charges; the skill then carries it.
export const holdsAttack = (draft: BattleDraft, hero: HeroStats, level: number): boolean =>
  hero.skills.some(
    (skill) => skillRank(level, skill.lag) > 0 && charging(skill, stateOf(draft, skill)),
  );

// Every skill gathers its budget; a timed one fires when its timer runs out and a foe stands.
export function skillsAct(draft: BattleDraft, dt: number, context: Context): void {
  const foesDamage = foesDamagePerSecond(draft);

  for (const member of membersOf(context.party, context.roster)) {
    for (const skill of member.hero.skills) {
      if (skillRank(member.level, skill.lag) === 0) continue;
      const state = stateOf(draft, skill);
      const rate = skillRate(
        member.hero,
        skill,
        member.level,
        context.party,
        context.roster,
        foesDamage,
      );
      const held = charging(skill, state) ? heldRate(member.hero, member.level, context.party) : 0;
      const cap = rate * Math.max(skill.cooldown ?? 0, BALANCE.skills.poolSeconds);
      let pool = Math.max(Math.min(state.pool + rate * dt, cap), state.pool) + held * dt;
      let readyIn = skill.trigger === SkillTrigger.Cooldown ? state.readyIn - dt : 0;

      while (readyIn <= 0 && skill.trigger === SkillTrigger.Cooldown && frontFoe(draft) !== -1) {
        fire(draft, { member, skill, budget: pool, target: frontFoe(draft) }, context);
        pool = 0;
        readyIn += skill.cooldown ?? 1;
      }
      draft.skills[skill.id] = { readyIn: Math.max(readyIn, 0), pool, misses: state.misses };
    }
  }
}

// A hero's hit may set off one of its skills.
export function afterHeroHit(draft: BattleDraft, heroId: string, context: Context): void {
  const member = membersOf(context.party, context.roster).find((each) => each.hero.id === heroId);

  if (!member) return;
  for (const skill of member.hero.skills) {
    const ready = stateOf(draft, skill).pool > 0 && frontFoe(draft) !== -1;

    if (!isLive(member, skill, SkillTrigger.OnHit) || !ready) continue;
    const { fired, state } = rolled(draft, skill);

    draft.skills[skill.id] = fired ? { ...state, pool: 0 } : state;
    if (fired) fire(draft, { member, skill, budget: state.pool, target: frontFoe(draft) }, context);
  }
}
