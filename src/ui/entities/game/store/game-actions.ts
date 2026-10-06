import { chargeUltimate, type GameSave } from '@engine';
import type { Wallet } from '@platform';
import { GameStatus } from '../constants';
import type { GameStore } from './game-store';

export function markReady(store: GameStore, game: GameSave, wallet: Wallet): void {
  store.setState({ status: GameStatus.Ready, game, wallet });
}

export function markFailed(store: GameStore): void {
  store.setState({ status: GameStatus.Failed });
}

export function replaceGame(store: GameStore, game: GameSave): void {
  store.setState({ game });
}

export function replaceWallet(store: GameStore, wallet: Wallet): void {
  store.setState({ wallet });
}

export function receiveTokens(store: GameStore, wallet: Wallet, burnedNow: number): void {
  store.setState((state) => ({
    wallet,
    income: { amount: burnedNow, count: state.income.count + 1 },
    game: state.game && {
      ...state.game,
      battle: chargeUltimate(state.game.battle, burnedNow),
    },
  }));
}

export function showNotice(store: GameStore, text: string): void {
  store.setState((state) => ({ notice: { id: (state.notice?.id ?? 0) + 1, text } }));
}
