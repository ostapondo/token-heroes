import type { Setting, Settings, WatchedAgent } from '@platform';
import { useCallback, useEffect, useState } from 'react';
import { useHost } from '../../../entities/host';

// The tray menu changes the same settings, so they are read fresh whenever the tab opens.
export function useSettings(): {
  readonly settings: Settings | null;
  readonly change: (setting: Setting, on: boolean) => void;
} {
  const host = useHost();
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    let live = true;

    host
      .settings()
      .then((loaded) => {
        if (live) setSettings(loaded);
      })
      .catch(() => undefined);

    return () => {
      live = false;
    };
  }, [host]);

  const change = useCallback(
    (setting: Setting, on: boolean) => {
      setSettings((current) => (current ? { ...current, [setting]: on } : current));
      host
        .changeSetting(setting, on)
        .then((changed) => {
          if (changed) setSettings(changed);
        })
        .catch(() => undefined);
    },
    [host],
  );

  return { settings, change };
}

export function useWatchedAgents(): readonly WatchedAgent[] {
  const host = useHost();
  const [agents, setAgents] = useState<readonly WatchedAgent[]>([]);

  useEffect(() => {
    let live = true;

    host
      .watchedAgents()
      .then((loaded) => {
        if (live) setAgents(loaded);
      })
      .catch(() => undefined);

    return () => {
      live = false;
    };
  }, [host]);

  return agents;
}
