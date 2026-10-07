import type { SpriteDef } from '@content';
import type { HeroRole, SkillEffect, SkillTrigger } from '@engine';

export interface RoleAction {
  readonly role: HeroRole;
  readonly amount: number;
  readonly seconds: number;
  readonly hp: number;
}

export interface SkillChip {
  readonly id: string;
  readonly name: string;
  readonly evolved: string;
  readonly rank: number;
  readonly tier: 0 | 1 | 2;
  readonly locked: boolean;
  readonly color: string;
  readonly icon: SpriteDef;
  readonly trigger: SkillTrigger;
  readonly cooldown: number | null;
  readonly chance: number | null;
  readonly charge: number | null;
  readonly effects: readonly SkillEffect[];
  // Damage a cast lands on the front foe, null for a skill that deals none.
  readonly hit: number | null;
  readonly nextRankAt: number;
  readonly evolvesAt: number | null;
}

export interface SkillGoal {
  readonly name: string;
  readonly rank: number;
  readonly opens: boolean;
  readonly levels: number;
}

// A rank along the bar to the next ×4, from 0 at its start to 1 at its end.
export interface SkillMark {
  readonly at: number;
  readonly color: string;
  readonly evolves: boolean;
}

export interface HeroRowModel {
  readonly heroId: string;
  readonly name: string;
  readonly level: number;
  readonly cost: number;
  readonly affordable: boolean;
  readonly levelsToMilestone: number;
  readonly milestoneProgress: number;
  readonly action: RoleAction;
  readonly skills: readonly SkillChip[];
  readonly goal: SkillGoal | null;
  readonly marks: readonly SkillMark[];
}

export interface HireRowModel {
  readonly heroId: string;
  readonly name: string;
  readonly cost: number;
  readonly unlockAtTokens: number;
  readonly unlocked: boolean;
  readonly affordable: boolean;
  readonly action: RoleAction;
  readonly skills: readonly SkillChip[];
}

export interface PartyRows {
  readonly members: readonly HeroRowModel[];
  readonly recruits: readonly HireRowModel[];
}
