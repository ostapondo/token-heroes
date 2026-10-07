import { type BattleDraft, foesDamagePerSecond } from '../battle/draft';
import { partyMend } from '../formulas';
import { partyMaxHp, partyVitals } from '../party';
import { heroById } from '../roster';
import { type BattleEvent, HeroRole, type HeroStats, type PartyState, type Roster } from '../types';
import { type FightRates, partyDamagePerSecond } from './budget';
import { castSkill } from './cast';
import { rollProc } from './procs';
import { skillRank } from './ranks';
import { type SkillState, type SkillStats, SkillTrigger } from './types';

export interface Member {
  readonly hero: HeroStats;
  readonly level: number;
}

export interface Context {
  readonly party: PartyState;
  readonly roster: Roster;
  readonly events: BattleEvent[];
}

export const membersOf = (party: PartyState, roster: Roster): Member[] =>
  party.heroes.map((slot) => ({ hero: heroById(roster, slot.heroId), level: slot.level }));

export const fightRates = (draft: BattleDraft, party: PartyState, roster: Roster): FightRates => ({
  partyDamage: partyDamagePerSecond(party, roster),
  foesDamage: foesDamagePerSecond(draft),
  mend: partyMend(partyVitals(party, roster)),
});

export const stateOf = (draft: BattleDraft, skill: SkillStats): SkillState =>
  draft.skills[skill.id] ?? { readyIn: skill.cooldown ?? 0, pool: 0, misses: 0 };

export const isLive = (member: Member, skill: SkillStats, trigger: SkillTrigger): boolean =>
  skill.trigger === trigger && skillRank(member.level, skill.lag) > 0;

export const charging = (skill: SkillStats, state: SkillState): boolean =>
  skill.trigger === SkillTrigger.Cooldown &&
  (skill.charge ?? 0) > 0 &&
  state.readyIn <= (skill.charge ?? 0);

// A proc rolls on the battle's own seed, so a fight plays out the same way every time.
export function rolled(
  draft: BattleDraft,
  skill: SkillStats,
): { fired: boolean; state: SkillState } {
  const state = stateOf(draft, skill);
  const roll = rollProc(skill.prd, state.misses, draft.seed);

  draft.seed = roll.seed;

  return { fired: roll.fired, state: { ...state, misses: roll.misses } };
}

interface Firing {
  readonly member: Member;
  readonly skill: SkillStats;
  readonly budget: number;
  readonly target: number;
  readonly deflected?: number;
}

export function fire(draft: BattleDraft, firing: Firing, context: Context): void {
  const { member, skill } = firing;

  castSkill(
    draft,
    {
      source: member.hero.id,
      skill,
      rank: skillRank(member.level, skill.lag),
      healer: member.hero.role === HeroRole.Healer,
      budget: firing.budget,
      rates: fightRates(draft, context.party, context.roster),
      target: firing.target,
      ...(firing.deflected === undefined ? {} : { deflected: firing.deflected }),
    },
    context.events,
    partyMaxHp(context.party, context.roster),
  );
}
