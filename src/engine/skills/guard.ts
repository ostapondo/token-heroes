import type { BattleDraft } from '../battle/draft';
import { safeAmount } from '../formulas';
import { BattleEventType } from '../types';
import { asDamage, asProtection } from './budget';
import { type Context, fightRates, fire, isLive, membersOf, rolled, stateOf } from './firing';
import { skillRank } from './ranks';
import { SkillTrigger } from './types';

// A hero's guard may proc on a foe's blow and spend everything it has gathered on it. If that
// covers the blow, the blow misses and the rest answers it; otherwise it softens the blow.
// Returns the part of the blow the guard took.
export function guard(draft: BattleDraft, foe: number, damage: number, context: Context): number {
  for (const member of membersOf(context.party, context.roster)) {
    for (const skill of member.hero.skills) {
      if (!isLive(member, skill, SkillTrigger.OnGuard) || stateOf(draft, skill).pool <= 0) continue;
      const { fired, state } = rolled(draft, skill);

      draft.skills[skill.id] = fired ? { ...state, pool: 0 } : state;
      if (!fired) continue;
      const rates = fightRates(draft, context.party, context.roster);
      const protection = asProtection(state.pool, rates);

      if (protection >= damage) {
        const answer = state.pool - asDamage(damage, true, rates);

        fire(draft, { member, skill, budget: answer, target: foe, deflected: foe }, context);

        return damage;
      }
      context.events.push({
        type: BattleEventType.Skill,
        source: member.hero.id,
        skill: skill.id,
        rank: skillRank(member.level, skill.lag),
        target: foe,
        hits: [],
        parried: safeAmount(protection),
      });

      return safeAmount(protection);
    }
  }

  return 0;
}

// A shield takes what it can of a blow and passes the rest on.
export function absorb(draft: BattleDraft, damage: number): number {
  const shield = draft.shield;

  if (!shield || shield.left <= 0) return 0;
  const blocked = Math.min(shield.amount, damage);

  draft.shield =
    shield.amount > blocked ? { ...shield, amount: shield.amount - blocked } : undefined;

  return blocked;
}
