import { heroDamage, heroHeal, heroHp, HeroRole, type HeroStats, type PartyVitals } from '@engine';
import type { RoleAction } from '../types';

export function roleAction(hero: HeroStats, level: number, party: PartyVitals): RoleAction {
  return {
    role: hero.role,
    amount: hero.role === HeroRole.Healer ? heroHeal(hero, level, party) : heroDamage(hero, level),
    seconds: hero.attackInterval,
    hp: heroHp(hero, level),
  };
}
