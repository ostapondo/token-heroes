export const HERO_ROLES = ['striker', 'tank', 'healer'] as const;
export type HeroRole = (typeof HERO_ROLES)[number];

export const ATTACK_STYLES = ['slash', 'arrow', 'bash', 'spell', 'heal'] as const;
export type AttackStyle = (typeof ATTACK_STYLES)[number];

export interface HeroStats {
  readonly id: string;
  readonly role: HeroRole;
  readonly attack: AttackStyle;
  readonly baseDamage: number;
  readonly baseHp: number;
  readonly attackInterval: number;
  readonly levelCostBase: number;
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

export const BATTLE_PHASES = ['fighting', 'wiped', 'cleared'] as const;
type BattlePhase = (typeof BATTLE_PHASES)[number];

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

export type BattleEvent =
  | {
      readonly type: 'hit';
      readonly source: string;
      readonly foe: number;
      readonly amount: number;
      readonly crit: boolean;
    }
  | { readonly type: 'strike'; readonly foe: number; readonly amount: number }
  | { readonly type: 'ultimate'; readonly foe: number; readonly amount: number }
  | { readonly type: 'heal'; readonly source: string; readonly amount: number }
  | { readonly type: 'partyHit'; readonly foe: number; readonly amount: number }
  | { readonly type: 'foeDefeated'; readonly foe: number; readonly boss: boolean }
  | { readonly type: 'stageCleared'; readonly stage: number }
  | { readonly type: 'stageStarted'; readonly stage: number }
  | { readonly type: 'wiped'; readonly reason: 'defeat' | 'timeout' }
  | { readonly type: 'respawned'; readonly stage: number };

export interface BattleStep {
  readonly battle: BattleState;
  readonly events: readonly BattleEvent[];
}
