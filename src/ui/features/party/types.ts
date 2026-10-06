import type { HeroRole } from '@engine';

export interface RoleAction {
  readonly role: HeroRole;
  readonly amount: number;
  readonly seconds: number;
  readonly hp: number;
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
}

export interface HireRowModel {
  readonly heroId: string;
  readonly name: string;
  readonly cost: number;
  readonly unlockAtTokens: number;
  readonly unlocked: boolean;
  readonly affordable: boolean;
  readonly action: RoleAction;
}

export interface PartyRows {
  readonly members: readonly HeroRowModel[];
  readonly recruits: readonly HireRowModel[];
}
