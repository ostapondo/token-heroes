import type { SkillBlueprint } from '@engine';
import type { SpriteDef } from './sprite';

// How the arena draws a skill; every look has its own effect in @render.
export const SkillLook = {
  Whirlwind: 'whirlwind',
  ArrowRain: 'arrow-rain',
  Snipe: 'snipe',
  Bulwark: 'bulwark',
  Sanctuary: 'sanctuary',
  Meteor: 'meteor',
  Backstab: 'backstab',
  LeapSlam: 'leap-slam',
  GlacialSpike: 'glacial-spike',
  RaiseDead: 'raise-dead',
  Justice: 'justice',
  Counter: 'counter',
  Crusade: 'crusade',
  PinningShot: 'pinning-shot',
  CallLightning: 'call-lightning',
} as const;
export type SkillLook = (typeof SkillLook)[keyof typeof SkillLook];

// A skill's mechanics come from @engine; its strength comes from its hero's budget, never from a
// number here. The rank-five form evolves under a name of its own.
export interface SkillDef extends SkillBlueprint {
  readonly name: string;
  readonly evolved: string;
  readonly look: SkillLook;
  readonly color: string;
  // A 12x12 icon for the party panel, drawn in fixed colours like a hero.
  readonly icon: SpriteDef;
}

export const defineSkill = (skill: SkillDef): SkillDef => skill;
