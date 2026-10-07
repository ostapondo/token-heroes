type ValueOf<T> = T[keyof T];

export const HeroRole = { Striker: 'striker', Tank: 'tank', Healer: 'healer' } as const;
export type HeroRole = ValueOf<typeof HeroRole>;

export const AttackStyle = {
  Slash: 'slash',
  Arrow: 'arrow',
  Bash: 'bash',
  Spell: 'spell',
  Heal: 'heal',
} as const;
export type AttackStyle = ValueOf<typeof AttackStyle>;

export const SuperBossTier = { Medium: 'medium', Strong: 'strong' } as const;
export type SuperBossTier = ValueOf<typeof SuperBossTier>;

// What sets a super boss fight apart from a plain one.
export const BossMechanic = {
  StealContext: 'steal-context',
  Hallucinate: 'hallucinate',
  Inject: 'inject',
  Flatter: 'flatter',
  Throttle: 'throttle',
  Loop: 'loop',
  Unmask: 'unmask',
  Maximize: 'maximize',
} as const;
export type BossMechanic = ValueOf<typeof BossMechanic>;

export const BattlePhase = { Fighting: 'fighting', Wiped: 'wiped', Cleared: 'cleared' } as const;
export type BattlePhase = ValueOf<typeof BattlePhase>;

export const BattleEventType = {
  Hit: 'hit',
  Strike: 'strike',
  Ultimate: 'ultimate',
  Heal: 'heal',
  PartyHit: 'partyHit',
  FoeDefeated: 'foeDefeated',
  StageCleared: 'stageCleared',
  StageStarted: 'stageStarted',
  Wiped: 'wiped',
  Respawned: 'respawned',
  Mechanic: 'mechanic',
} as const;
export type BattleEventType = ValueOf<typeof BattleEventType>;

export interface HeroStats {
  readonly id: string;
  readonly role: HeroRole;
  readonly attack: AttackStyle;
  readonly attackInterval: number;
  readonly power: number;
  readonly baseDamage: number;
  readonly baseHp: number;
  readonly hireCost: number;
  readonly unlockAtTokens: number;
}

export interface FoeStats {
  readonly id: string;
  readonly hpScale: number;
  readonly damageScale: number;
}

export interface BossStats extends FoeStats {
  readonly element: string;
  readonly mechanic?: BossMechanic | undefined;
}

export interface Roster {
  readonly heroes: readonly HeroStats[];
  readonly bosses: readonly BossStats[];
  readonly superBosses: Readonly<Record<SuperBossTier, readonly BossStats[]>>;
  readonly enemies: readonly FoeStats[];
}

interface HeroSlot {
  readonly heroId: string;
  readonly level: number;
}

export interface PartyState {
  readonly heroes: readonly HeroSlot[];
  readonly renown?: number | undefined;
}

export interface Foe {
  readonly id: string;
  readonly boss: boolean;
  readonly hp: number;
  readonly maxHp: number;
  readonly damage: number;
  readonly attackInterval: number;
  readonly attackIn: number;
  readonly mechanic?: BossMechanic | undefined;
  // Seconds the foe has fought, for a mechanic that comes round on a timer.
  readonly clock?: number | undefined;
  // A mechanic that fires once per fight has fired.
  readonly spent?: boolean | undefined;
}

export interface BattleState {
  readonly stage: number;
  readonly phase: BattlePhase;
  readonly phaseLeft: number;
  readonly foes: readonly Foe[];
  readonly partyHp: number;
  readonly cooldowns: Readonly<Record<string, number>>;
  readonly strikeReadyIn: number;
  readonly ultimate: number;
  readonly seed: number;
}

type Event<T extends BattleEventType, Data = object> = Readonly<{ type: T } & Data>;
interface FoeAmount {
  foe: number;
  amount: number;
}

export type BattleEvent =
  | Event<typeof BattleEventType.Hit, FoeAmount & { source: string; crit: boolean }>
  | Event<typeof BattleEventType.Strike, FoeAmount>
  | Event<typeof BattleEventType.Ultimate, FoeAmount>
  | Event<typeof BattleEventType.Heal, { source: string; amount: number }>
  | Event<typeof BattleEventType.PartyHit, FoeAmount>
  | Event<typeof BattleEventType.FoeDefeated, { foe: number; boss: boolean }>
  | Event<typeof BattleEventType.StageCleared, { stage: number }>
  | Event<typeof BattleEventType.StageStarted, { stage: number }>
  | Event<typeof BattleEventType.Wiped>
  | Event<typeof BattleEventType.Respawned, { stage: number }>
  | Event<typeof BattleEventType.Mechanic, FoeAmount & { mechanic: BossMechanic }>;

export interface BattleStep {
  readonly battle: BattleState;
  readonly events: readonly BattleEvent[];
}
