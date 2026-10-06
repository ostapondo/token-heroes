import { t } from '@i18n';
import { SpendRefusal, type Host } from '@platform';
import { replaceWallet, showNotice } from '../store/game-actions';
import type { GameStore } from '../store/game-store';

export async function spendCoins(host: Host, store: GameStore, amount: number): Promise<boolean> {
  const result = await host.spend(amount);

  if (result.ok) {
    replaceWallet(store, result.wallet);

    return true;
  }
  const refused = result.reason === SpendRefusal.Insufficient;

  showNotice(store, t(refused ? 'notice.notEnoughCoins' : 'notice.hostUnavailable'));

  return false;
}
