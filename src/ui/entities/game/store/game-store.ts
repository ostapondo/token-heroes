import { createStore, type StoreApi } from 'zustand/vanilla';
import { GameStatus } from '../constants';
import type { GameState } from '../types';

export type GameStore = StoreApi<GameState>;

const INITIAL_STATE: GameState = {
  status: GameStatus.Loading,
  game: null,
  wallet: { burned: 0, spent: 0, balance: 0 },
  income: { amount: 0, count: 0 },
  notice: null,
};

export function createGameStore(): GameStore {
  return createStore<GameState>()(() => INITIAL_STATE);
}
