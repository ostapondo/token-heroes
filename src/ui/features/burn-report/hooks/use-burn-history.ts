import type { BurnHistory } from '@platform';
import { useEffect, useState } from 'react';
import { useHost } from '../../../entities/host';
import { REFRESH_MS } from '../constants';

interface HistoryState {
  readonly history: BurnHistory | null;
  readonly readAt: Date;
  readonly failed: boolean;
}

// The menu asks the host for its history when it opens and again every few seconds while open.
export function useBurnHistory(): HistoryState {
  const host = useHost();
  const [state, setState] = useState<HistoryState>(() => ({
    history: null,
    readAt: new Date(),
    failed: false,
  }));

  useEffect(() => {
    let live = true;
    const load = () => {
      host
        .burnHistory()
        .then((history) => {
          if (live && history) setState({ history, readAt: new Date(), failed: false });
          if (live && !history) setState((previous) => ({ ...previous, failed: true }));
        })
        .catch(() => {
          if (live) setState((previous) => ({ ...previous, failed: true }));
        });
    };

    load();
    const timer = setInterval(load, REFRESH_MS);

    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [host]);

  return state;
}
