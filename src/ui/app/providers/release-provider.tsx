import type { Host } from '@platform';
import { useEffect, useState, type ReactNode } from 'react';
import { ReleaseContext, ReleaseService } from '../../entities/release';

interface Props {
  readonly host: Host;
  readonly children: ReactNode;
}

export function ReleaseProvider({ host, children }: Props) {
  const [release] = useState(() => new ReleaseService(host));

  useEffect(() => {
    release.start();

    return () => release.stop();
  }, [release]);

  return <ReleaseContext value={release}>{children}</ReleaseContext>;
}
