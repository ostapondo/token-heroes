import type { Host } from '@platform';
import { use } from 'react';
import { HostContext } from './host-context';

export function useHost(): Host {
  const host = use(HostContext);

  if (!host) throw new Error('useHost needs a HostContext provider');

  return host;
}
