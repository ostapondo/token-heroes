export interface HeroRowModel {
  readonly heroId: string;
  readonly name: string;
  readonly level: number;
  readonly cost: number;
  readonly affordable: boolean;
  readonly levelsToMilestone: number;
  readonly milestoneProgress: number;
}

export interface HireRowModel {
  readonly heroId: string;
  readonly name: string;
  readonly cost: number;
  readonly unlockAtTokens: number;
  readonly unlocked: boolean;
  readonly affordable: boolean;
}

export interface PartyRows {
  readonly members: readonly HeroRowModel[];
  readonly recruits: readonly HireRowModel[];
}
