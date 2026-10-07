import { heroDamage, heroHp, heroMend, HeroRole, type HeroStats, type PartyVitals } from '@engine';
import type { RoleAction } from '../types';

// Ascension multiplies the party's power; a healer undoes a share of the foes' damage instead.
export function roleAction(
  hero: HeroStats,
  level: number,
  party: PartyVitals,
  power = 1,
): RoleAction {
  return {
    role: hero.role,
    amount:
      hero.role === HeroRole.Healer
        ? Math.round(heroMend(hero, level, party) * 100)
        : Math.round(heroDamage(hero, level) * power),
    seconds: hero.attackInterval,
    hp: Math.round(heroHp(hero, level) * power),
  };
}
