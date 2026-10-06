import { heroDamage, heroHeal, heroHp, HeroRole, type HeroStats } from '@engine';
import type { RoleAction } from '../types';

export function roleAction(hero: HeroStats, level: number): RoleAction {
  return {
    role: hero.role,
    amount: hero.role === HeroRole.Healer ? heroHeal(hero, level) : heroDamage(hero, level),
    seconds: hero.attackInterval,
    hp: heroHp(hero, level),
  };
}
