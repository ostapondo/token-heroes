import { useEffect, useState } from 'react';
import { useHost } from '../../../entities/host';

export function useVersion(): string | null {
  const host = useHost();
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    let live = true;

    host
      .version()
      .then((found) => {
        if (live) setVersion(found);
      })
      .catch(() => undefined);

    return () => {
      live = false;
    };
  }, [host]);

  return version;
}
