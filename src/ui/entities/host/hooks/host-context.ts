import type { Host } from '@platform';
import { createContext } from 'react';

export const HostContext = createContext<Host | null>(null);
