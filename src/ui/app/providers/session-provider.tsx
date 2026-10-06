import { CONTENT, starterHero, toRoster } from '@content';
import type { Host } from '@platform';
import { useEffect, useState, type ReactNode } from 'react';
import { GameSession, SessionContext } from '../../entities/game';

interface Props {
  readonly host: Host;
  readonly children: ReactNode;
}

export function SessionProvider({ host, children }: Props) {
  const [session] = useState(
    () => new GameSession(host, toRoster(CONTENT), starterHero(CONTENT).id),
  );

  useEffect(() => {
    void session.start();

    return () => session.stop();
  }, [session]);

  return <SessionContext value={session}>{children}</SessionContext>;
}
