import {
  FoeAttack,
  type AttackStyle,
  type BossMechanic,
  type HeroRole,
  type SuperBossTier,
} from '@engine';
import type { DeathKind } from './death';
import type { CreatureId, ElementId, LairId } from './ids';
import type { BipedLook, Look } from './look';
import type { BackdropDef } from './scenery';
import type { Palette } from './sprite';
import type { WeatherDef } from './weather';

export interface ElementDef {
  readonly id: ElementId | LairId;
  readonly name: string;
  readonly status: string;
  readonly palette: Palette;
  readonly accent: string;
  readonly backdrop: BackdropDef;
  readonly weather: readonly WeatherDef[];
  readonly death: DeathKind;
}

// The rules own the attack kinds, since an attack decides how many heroes a boss's blow reaches.
export const CreatureAttack = FoeAttack;
export type CreatureAttack = FoeAttack;

export interface CreatureDef {
  readonly id: CreatureId;
  readonly name: string;
  readonly attack: CreatureAttack;
  readonly hpScale: number;
  readonly damageScale: number;
  readonly look: Look;
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
  readonly look: Look;
}

// A pack enemy takes the colours of the element it fights in.
export interface EnemyDef {
  readonly id: string;
  readonly name: string;
  readonly hpScale: number;
  readonly damageScale: number;
  readonly look: Look;
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
  // The hero's own colour: its tile, its ring in the arena and the glow its gear takes on.
  readonly tint: `#${string}`;
  readonly look: BipedLook;
}

export const defineElement = (element: ElementDef & { readonly id: ElementId }): ElementDef =>
  element;
export const defineLair = (lair: ElementDef & { readonly id: LairId }): ElementDef => lair;
export const defineCreature = (creature: CreatureDef): CreatureDef => creature;
export const defineBoss = (boss: BossDef): BossDef => boss;
export const defineSuperBoss = (boss: SuperBossDef): SuperBossDef => boss;
export const defineEnemy = (enemy: EnemyDef): EnemyDef => enemy;
export const defineHero = (hero: HeroDef): HeroDef => hero;
