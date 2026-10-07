import { BALANCE } from '../balance';
import { baseDamagePerSecond, healShare, heroAttack, heroDamage, heroMend } from '../formulas';
import { partyVitals, renownPower } from '../party';
import { heroById } from '../roster';
import { HeroRole, type HeroStats, type PartyState, type Roster } from '../types';
import { skillRank, skillShare } from './ranks';
import { SkillEffectKind, type SkillStats, SkillTrigger } from './types';

// A skill takes over a share of its hero's hits, so it carries the crits they would have rolled.
const CRIT_FACTOR = 1 + BALANCE.critChance * (BALANCE.critMultiplier - 1);

export interface FightRates {
  // The party's damage per second with skills and crits, the foes' damage per second, and the
  // share of the foes' damage the healers undo.
  readonly partyDamage: number;
  readonly foesDamage: number;
  readonly mend: number;
}

export function partyDamagePerSecond(party: PartyState, roster: Roster): number {
  const renown = renownPower(party.renown ?? 0);

  return party.heroes.reduce((sum, slot) => {
    const hero = heroById(roster, slot.heroId);

    return hero.role === HeroRole.Healer
      ? sum
      : sum + (heroDamage(hero, slot.level) / hero.attackInterval) * renown * CRIT_FACTOR;
  }, 0);
}

// Budget per second, in damage for a striker or tank and in healing for a healer.
export function skillRate(
  hero: HeroStats,
  skill: SkillStats,
  level: number,
  party: PartyState,
  roster: Roster,
  foesDamage: number,
): number {
  if (skillRank(level, skill.lag) === 0) return 0;
  if (hero.role !== HeroRole.Healer) {
    return (
      baseDamagePerSecond(hero, level) *
      skillShare(hero, skill, level) *
      renownPower(party.renown ?? 0) *
      CRIT_FACTOR
    );
  }
  const mend = heroMend(hero, level, partyVitals(party, roster));

  return (mend * foesDamage * (1 - healShare(hero, level))) / Math.max(hero.skills.length, 1);
}

// Seconds between casts on average: the cooldown, or the hero's attacks a hit-proc waits for.
// A guard waits on the foes' blows, so it has no interval of its own.
function castInterval(hero: HeroStats, skill: SkillStats): number | null {
  if (skill.trigger === SkillTrigger.Cooldown) return skill.cooldown ?? null;
  if (skill.trigger === SkillTrigger.OnHit && skill.chance)
    return hero.attackInterval / skill.chance;

  return null;
}

// The damage a cast lands on the front foe at a level, before renown; null for a skill that deals
// none or casts on the foes' blows.
export function skillHitPerCast(hero: HeroStats, skill: SkillStats, level: number): number | null {
  const interval = castInterval(hero, skill);
  const hit = skill.effects.find((effect) => effect.kind === SkillEffectKind.Hit);

  if (interval === null || !hit || !('share' in hit) || hero.role === HeroRole.Healer) return null;

  return (
    baseDamagePerSecond(hero, level) *
    skillShare(hero, skill, level) *
    CRIT_FACTOR *
    interval *
    hit.share
  );
}

// The hits a charging hero holds back, which its skill then carries.
export const heldRate = (hero: HeroStats, level: number, party: PartyState): number =>
  hero.role === HeroRole.Healer
    ? 0
    : (heroAttack(hero, level) / hero.attackInterval) *
      renownPower(party.renown ?? 0) *
      CRIT_FACTOR;

// The party wins when its damage times its toughness beats the foes' health times their damage,
// so damage the foes do not deal is worth damage dealt at the rate of the party's damage to the
// foes'. Healers undo a share of the foes' damage whether it lands or not, so a blow kept off
// saves its whole amount against the share that is left: the rate counts only that share.
const netFoesDamage = (rates: FightRates): number => rates.foesDamage * (1 - rates.mend);

// A budget turned into damage; a healer's budget is healing and converts at the same rate.
export function asDamage(budget: number, healer: boolean, rates: FightRates): number {
  if (!healer) return budget;
  const net = netFoesDamage(rates);

  return net > 0 ? (budget * rates.partyDamage) / net : 0;
}

export function asProtection(damage: number, rates: FightRates): number {
  return rates.partyDamage > 0 ? (damage * netFoesDamage(rates)) / rates.partyDamage : 0;
}

// Seconds the foes' blows can be held back for the same worth.
export function asHeldSeconds(damage: number, rates: FightRates): number {
  return rates.foesDamage > 0 ? asProtection(damage, rates) / rates.foesDamage : 0;
}

// Seconds of the party's own damage that a budget buys.
export function asPartySeconds(damage: number, rates: FightRates): number {
  return rates.partyDamage > 0 ? damage / rates.partyDamage : 0;
}
