import type { Host } from '@platform';
import { SESSION_TIMING } from '../constants';

interface LoopHooks {
  readonly host: Host;
  readonly tick: (seconds: number) => void;
  readonly save: (where: string) => void;
  readonly receive: Parameters<Host['onWallet']>[0];
}

export function startLoop({ host, tick, save, receive }: LoopHooks): (() => void)[] {
  const ticker = setInterval(() => tick(SESSION_TIMING.tickMs / 1000), SESSION_TIMING.tickMs);
  const saver = setInterval(() => save('Autosave'), SESSION_TIMING.autosaveMs);
  const unlisten = host.onWallet(receive);
  const saveOnHide = () => save('Saving on hide');

  window.addEventListener('pagehide', saveOnHide);

  return [
    () => clearInterval(ticker),
    () => clearInterval(saver),
    () => window.removeEventListener('pagehide', saveOnHide),
    unlisten,
  ];
}
