import type { AttackStyle, BossMechanic, HeroRole, SuperBossTier } from '@engine';
import type { CreatureId, ElementId, LairId } from './ids';
import type { BackdropDef } from './scenery';
import type { Palette, SpriteDef } from './sprite';
import type { WeatherDef } from './weather';

export interface ElementDef {
  readonly id: ElementId | LairId;
  readonly name: string;
  readonly status: string;
  readonly palette: Palette;
  readonly accent: string;
  readonly backdrop: BackdropDef;
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

// A super boss is drawn in its own colours and fights in its own lair. Its tier sets the stages
// it stands on and its order its turn among the super bosses of that tier.
export interface SuperBossDef {
  readonly id: string;
  readonly name: string;
  readonly tier: SuperBossTier;
  readonly order: number;
  readonly lair: LairId;
  readonly attack: CreatureAttack;
  readonly mechanic: BossMechanic;
  readonly hpScale: number;
  readonly damageScale: number;
  readonly palette: Palette;
  readonly sprite: SpriteDef;
}

// A pack enemy takes the colours of the element it fights in.
export interface EnemyDef {
  readonly id: string;
  readonly name: string;
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

export const defineElement = (element: ElementDef & { readonly id: ElementId }): ElementDef =>
  element;
export const defineLair = (lair: ElementDef & { readonly id: LairId }): ElementDef => lair;
export const defineCreature = (creature: CreatureDef): CreatureDef => creature;
export const defineBoss = (boss: BossDef): BossDef => boss;
export const defineSuperBoss = (boss: SuperBossDef): SuperBossDef => boss;
export const defineEnemy = (enemy: EnemyDef): EnemyDef => enemy;
export const defineHero = (hero: HeroDef): HeroDef => hero;
