import type { AttackStyle, HeroRole } from '@engine';
import type { CreatureId, ElementId } from './ids';
import type { Palette, SpriteDef } from './sprite';
import type { WeatherDef } from './weather';

export interface ElementDef {
  readonly id: ElementId;
  readonly name: string;
  readonly status: string;
  readonly palette: Palette;
  readonly sky: string;
  readonly floor: string;
  readonly accent: string;
  readonly weather: readonly WeatherDef[];
}

export const CreatureAttack = {
  Breath: 'breath',
  Lunge: 'lunge',
  Slam: 'slam',
  Scythe: 'scythe',
  Spit: 'spit',
} as const;
export type CreatureAttack = (typeof CreatureAttack)[keyof typeof CreatureAttack];

export interface CreatureDef {
  readonly id: CreatureId;
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
  readonly creature: CreatureId;
  readonly element: ElementId;
}

export interface EnemyDef {
  readonly id: string;
  readonly name: string;
  readonly element: ElementId;
  readonly hpScale: number;
  readonly damageScale: number;
  readonly sprite: SpriteDef;
}

// Strength, price and unlock come from the hero's order through @engine's designHero.
export interface HeroDef {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  readonly role: HeroRole;
  readonly attack: AttackStyle;
  readonly attackInterval: number;
  readonly focus?: number;
  readonly sprite: SpriteDef;
}

export const defineElement = (element: ElementDef): ElementDef => element;
export const defineCreature = (creature: CreatureDef): CreatureDef => creature;
export const defineBoss = (boss: BossDef): BossDef => boss;
export const defineEnemy = (enemy: EnemyDef): EnemyDef => enemy;
export const defineHero = (hero: HeroDef): HeroDef => hero;
