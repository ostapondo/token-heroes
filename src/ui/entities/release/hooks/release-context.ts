import { createContext } from 'react';
import type { ReleaseService } from '../session/release-service';

export const ReleaseContext = createContext<ReleaseService | null>(null);
