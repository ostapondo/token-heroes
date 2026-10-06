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

export const BattlePhase = { Fighting: 'fighting', Wiped: 'wiped', Cleared: 'cleared' } as const;
export type BattlePhase = ValueOf<typeof BattlePhase>;

export const WipeReason = { Defeat: 'defeat', Timeout: 'timeout' } as const;
export type WipeReason = ValueOf<typeof WipeReason>;

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
}

export interface Roster {
  readonly heroes: readonly HeroStats[];
  readonly bosses: readonly BossStats[];
  readonly enemies: readonly FoeStats[];
}

interface HeroSlot {
  readonly heroId: string;
  readonly level: number;
}

export interface PartyState {
  readonly heroes: readonly HeroSlot[];
}

export interface Foe {
  readonly id: string;
  readonly boss: boolean;
  readonly hp: number;
  readonly maxHp: number;
  readonly damage: number;
  readonly attackInterval: number;
  readonly attackIn: number;
}

export interface BattleState {
  readonly stage: number;
  readonly phase: BattlePhase;
  readonly phaseLeft: number;
  readonly foes: readonly Foe[];
  readonly partyHp: number;
  readonly cooldowns: Readonly<Record<string, number>>;
  readonly bossTimeLeft: number;
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
  | Event<typeof BattleEventType.Wiped, { reason: WipeReason }>
  | Event<typeof BattleEventType.Respawned, { stage: number }>;

export interface BattleStep {
  readonly battle: BattleState;
  readonly events: readonly BattleEvent[];
}
