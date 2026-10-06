import { ascensionOffer, BattlePhase, type AscensionOffer, type PartyState } from '@engine';
import type { GameStatus } from '../constants';
import type { BossStatus, GameState, Income, Notice, WipeStatus } from '../types';

export const selectStatus = (state: GameState): GameStatus => state.status;
export const selectNotice = (state: GameState): Notice | null => state.notice;
export const selectIncome = (state: GameState): Income => state.income;
export const selectBalance = (state: GameState): number => state.wallet.balance;
export const selectBurned = (state: GameState): number => state.wallet.burned;
export const selectStage = (state: GameState): number => state.game?.battle.stage ?? 1;
export const selectParty = (state: GameState): PartyState | undefined => state.game?.party;
export const selectPartyHp = (state: GameState): number => state.game?.battle.partyHp ?? 0;

export const selectUltimatePercent = (state: GameState): number =>
  Math.floor((state.game?.battle.ultimate ?? 0) * 100);

export function selectBossStatus(state: GameState): BossStatus | null {
  const battle = state.game?.battle;
  const foe = battle?.foes[0];

  if (!battle || !foe?.boss) return null;

  return {
    bossId: foe.id,
    hp: foe.hp,
    maxHp: foe.maxHp,
    secondsLeft: Math.ceil(battle.bossTimeLeft),
  };
}

export function selectWipeStatus(state: GameState): WipeStatus {
  const battle = state.game?.battle;

  return {
    wiped: battle?.phase === BattlePhase.Wiped,
    secondsLeft: Math.ceil(battle?.phaseLeft ?? 0),
  };
}

export const selectAscension = (state: GameState): AscensionOffer | null =>
  state.game ? ascensionOffer(state.game) : null;
