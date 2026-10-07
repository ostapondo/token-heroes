import type { GameSave } from '@engine';
import type { Wallet } from '@platform';
import type { GameStatus } from './constants';

export interface Notice {
  readonly id: number;
  readonly text: string;
}

export interface Income {
  readonly amount: number;
  readonly count: number;
}

export interface GameState {
  readonly status: GameStatus;
  readonly game: GameSave | null;
  readonly wallet: Wallet;
  readonly income: Income;
  readonly notice: Notice | null;
}

export interface BossStatus {
  readonly bossId: string;
  readonly hp: number;
  readonly maxHp: number;
}

export interface WipeStatus {
  readonly wiped: boolean;
  readonly secondsLeft: number;
}
