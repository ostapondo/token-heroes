import type { AttackStyle, HeroRole } from '@engine';
import type { Palette, SpriteDef } from './sprite';
import type { WeatherDef } from './weather';

export interface ElementDef {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly palette: Palette;
  readonly sky: string;
  readonly floor: string;
  readonly accent: string;
  readonly weather: readonly WeatherDef[];
}

export const CREATURE_ATTACKS = ['breath', 'lunge', 'slam', 'scythe', 'spit'] as const;
export type CreatureAttack = (typeof CREATURE_ATTACKS)[number];

export interface CreatureDef {
  readonly id: string;
  readonly name: string;
  readonly attack: CreatureAttack;
  readonly hpScale: number;
  readonly damageScale: number;
  readonly sprite: SpriteDef;
}

export interface BossDef {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  readonly creature: string;
  readonly element: string;
}

export interface EnemyDef {
  readonly id: string;
  readonly name: string;
  readonly element: string;
  readonly hpScale: number;
  readonly damageScale: number;
  readonly sprite: SpriteDef;
}

export interface HeroDef {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  readonly role: HeroRole;
  readonly attack: AttackStyle;
  readonly baseDamage: number;
  readonly baseHp: number;
  readonly attackInterval: number;
  readonly levelCostBase: number;
  readonly hireCost: number;
  readonly unlockAtTokens: number;
  readonly sprite: SpriteDef;
}

export const defineElement = (element: ElementDef): ElementDef => element;
export const defineCreature = (creature: CreatureDef): CreatureDef => creature;
export const defineBoss = (boss: BossDef): BossDef => boss;
export const defineEnemy = (enemy: EnemyDef): EnemyDef => enemy;
export const defineHero = (hero: HeroDef): HeroDef => hero;
